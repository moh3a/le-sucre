import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { database_history } from "../database/schema";
import { generate_id } from "@/lib/utils";
import logger from "@/lib/logger";

const pool = db.$client as import("mysql2/promise").Pool;

type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  rows_affected: number;
  duration_ms: number;
};

type TableDescription = {
  columns: {
    name: string;
    type: string;
    nullable: string;
    key: string;
    default_value: string;
  }[];
  row_count: number;
};

type ExportResult = {
  data: string;
  file_name: string;
  row_count: number;
  duration_ms: number;
};

type ImportSqlResult = {
  statements_executed: number;
  errors: string[];
  duration_ms: number;
};

type ImportCsvResult = {
  rows_imported: number;
  duration_ms: number;
};

type JobTriggerResult = {
  job_name: string;
  status: string;
  duration_ms: number;
};

export const KNOWN_JOBS = [
  {
    name: "soft-delete-cleanup",
    description: "Nettoyage des enregistrements supprimés",
  },
  {
    name: "reservation-expiry",
    description: "Expiration des réservations expirées",
  },
  {
    name: "shipping",
    description: "Traitement des envois en attente",
  },
  {
    name: "payment",
    description: "Traitement des paiements en attente",
  },
] as const;

function escape_csv_value(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (
    str.includes('"') ||
    str.includes(",") ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escape_sql_value(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  }
  const str = String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `'${str}'`;
}

async function log_to_history(params: {
  operation_type: string;
  query?: string;
  table_name?: string;
  status: string;
  rows_affected?: number;
  duration_ms?: number;
  error_message?: string;
  file_name?: string;
  file_format?: string;
  executed_by?: string;
}): Promise<void> {
  try {
    await db.insert(database_history).values({
      operation_type: params.operation_type,
      query: params.query ?? null,
      table_name: params.table_name ?? null,
      status: params.status,
      rows_affected:
        params.rows_affected !== undefined
          ? String(params.rows_affected)
          : null,
      duration_ms:
        params.duration_ms !== undefined ? String(params.duration_ms) : null,
      error_message: params.error_message ?? null,
      file_name: params.file_name ?? null,
      file_format: params.file_format ?? null,
      executed_by: params.executed_by ?? null,
    });
  } catch (error) {
    logger.error("database_history_log_failed", {
      operation_type: params.operation_type,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

export class DatabaseManagementService {
  async execute_query(
    query: string,
    user_id?: string,
  ): Promise<QueryResult> {
    const start = Date.now();

    try {
      const [result, fields] = await pool.query(query);
      const duration_ms = Date.now() - start;

      if (Array.isArray(result) && fields && fields.length > 0) {
        const columns = fields.map(
          (f: { name: string }) => f.name,
        );
        const rows = result as Record<string, unknown>[];

        await log_to_history({
          operation_type: "query",
          query,
          status: "success",
          rows_affected: rows.length,
          duration_ms,
          executed_by: user_id,
        });

        return {
          columns,
          rows,
          rows_affected: rows.length,
          duration_ms,
        };
      }

      const header = result as import("mysql2/promise").ResultSetHeader;
      const affected = header.affectedRows ?? 0;

      await log_to_history({
        operation_type: "query",
        query,
        status: "success",
        rows_affected: affected,
        duration_ms,
        executed_by: user_id,
      });

      return {
        columns: [],
        rows: [],
        rows_affected: affected,
        duration_ms,
      };
    } catch (error) {
      const duration_ms = Date.now() - start;
      const error_message =
        error instanceof Error ? error.message : "Unknown error";

      await log_to_history({
        operation_type: "query",
        query,
        status: "error",
        duration_ms,
        error_message,
        executed_by: user_id,
      });

      logger.error("database_query_failed", {
        query,
        message: error_message,
      });

      throw new Error(error_message);
    }
  }

  async list_tables(): Promise<string[]> {
    const [rows] = await pool.query("SHOW TABLES");
    const result = rows as Record<string, string>[];
    const key = Object.keys(result[0] ?? {})[0] ?? "";
    return result.map((row) => row[key] ?? "");
  }

  async describe_table(table_name: string): Promise<TableDescription> {
    const escaped = table_name.replace(/`/g, "``");
    const [col_rows] = await pool.query(`DESCRIBE \`${escaped}\``);
    const columns = (
      col_rows as Record<string, unknown>[]
    ).map((row) => ({
      name: String(row["Field"] ?? ""),
      type: String(row["Type"] ?? ""),
      nullable: String(row["Null"] ?? ""),
      key: String(row["Key"] ?? ""),
      default_value:
        row["Default"] === null ? "" : String(row["Default"]),
    }));

    const [count_rows] = await pool.query(
      `SELECT COUNT(*) as count FROM \`${escaped}\``,
    );
    const count_result = count_rows as Record<string, unknown>[];
    const row_count = Number(count_result[0]?.["count"] ?? 0);

    return { columns, row_count };
  }

  async export_table(
    table_name: string,
    format: "csv" | "sql" | "json",
    user_id?: string,
  ): Promise<ExportResult> {
    const start = Date.now();
    const escaped = table_name.replace(/`/g, "``");

    try {
      const [rows] = await pool.query(
        `SELECT * FROM \`${escaped}\` LIMIT 10000`,
      );
      const data_rows = rows as Record<string, unknown>[];
      const duration_ms = Date.now() - start;

      let data: string;
      let file_extension: string;

      if (format === "csv") {
        if (data_rows.length === 0) {
          data = "";
        } else {
          const headers = Object.keys(data_rows[0]);
          const header_line = headers.map(escape_csv_value).join(",");
          const data_lines = data_rows.map((row) =>
            headers.map((h) => escape_csv_value(row[h])).join(","),
          );
          data = [header_line, ...data_lines].join("\n");
        }
        file_extension = "csv";
      } else if (format === "sql") {
        if (data_rows.length === 0) {
          data = "";
        } else {
          const columns = Object.keys(data_rows[0]);
          const escaped_columns = columns
            .map((c) => `\`${c.replace(/`/g, "``")}\``)
            .join(", ");
          const statements = data_rows.map((row) => {
            const values = columns
              .map((c) => escape_sql_value(row[c]))
              .join(", ");
            return `INSERT INTO \`${escaped}\` (${escaped_columns}) VALUES (${values});`;
          });
          data = statements.join("\n");
        }
        file_extension = "sql";
      } else {
        data = JSON.stringify(data_rows, null, 2);
        file_extension = "json";
      }

      const file_name = `${table_name}_export_${Date.now()}.${file_extension}`;

      await log_to_history({
        operation_type: "export",
        table_name,
        status: "success",
        rows_affected: data_rows.length,
        duration_ms,
        file_name,
        file_format: format,
        executed_by: user_id,
      });

      return {
        data,
        file_name,
        row_count: data_rows.length,
        duration_ms,
      };
    } catch (error) {
      const duration_ms = Date.now() - start;
      const error_message =
        error instanceof Error ? error.message : "Unknown error";

      await log_to_history({
        operation_type: "export",
        table_name,
        status: "error",
        duration_ms,
        error_message,
        executed_by: user_id,
      });

      logger.error("database_export_failed", {
        table_name,
        format,
        message: error_message,
      });

      throw new Error(error_message);
    }
  }

  async import_sql(
    sql_content: string,
    user_id?: string,
  ): Promise<ImportSqlResult> {
    const start = Date.now();
    const statements = sql_content
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let statements_executed = 0;
    const errors: string[] = [];

    for (const statement of statements) {
      try {
        await pool.query(statement);
        statements_executed++;
      } catch (error) {
        const error_message =
          error instanceof Error ? error.message : "Unknown error";
        const truncated =
          statement.length > 200
            ? statement.slice(0, 200) + "..."
            : statement;
        errors.push(`Statement failed: "${truncated}" → ${error_message}`);
        logger.error("database_import_sql_statement_failed", {
          statement_preview: truncated,
          message: error_message,
        });
      }
    }

    const duration_ms = Date.now() - start;

    await log_to_history({
      operation_type: "import_sql",
      query: sql_content.slice(0, 2000),
      status: errors.length > 0 ? "partial" : "success",
      rows_affected: statements_executed,
      duration_ms,
      error_message: errors.length > 0 ? errors.join("\n") : null,
      executed_by: user_id,
    });

    if (errors.length > 0 && statements_executed === 0) {
      throw new Error(
        `All ${errors.length} statements failed:\n${errors.join("\n")}`,
      );
    }

    return { statements_executed, errors, duration_ms };
  }

  async import_csv(
    table_name: string,
    csv_content: string,
    user_id?: string,
  ): Promise<ImportCsvResult> {
    const start = Date.now();
    const escaped = table_name.replace(/`/g, "``");

    const lines = csv_content.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) {
      throw new Error(
        "CSV content must contain at least a header row and one data row",
      );
    }

    const headers = parse_csv_line(lines[0]);
    const escaped_columns = headers
      .map((h) => `\`${h.replace(/`/g, "``")}\``)
      .join(", ");

    const BATCH_SIZE = 100;
    let rows_imported = 0;

    for (let i = 1; i < lines.length; i += BATCH_SIZE) {
      const batch = lines.slice(i, i + BATCH_SIZE);
      const values_clauses: string[] = [];

      for (const line of batch) {
        const values = parse_csv_line(line);
        const escaped_values = headers.map((_, idx) =>
          escape_sql_value(values[idx] ?? null),
        );
        values_clauses.push(`(${escaped_values.join(", ")})`);
      }

      const insert_query = `INSERT INTO \`${escaped}\` (${escaped_columns}) VALUES ${values_clauses.join(", ")}`;

      try {
        const [result] = await pool.query(insert_query);
        const header = result as import("mysql2/promise").ResultSetHeader;
        rows_imported += header.affectedRows ?? batch.length;
      } catch (error) {
        const error_message =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("database_import_csv_batch_failed", {
          table_name,
          batch_start: i,
          batch_size: batch.length,
          message: error_message,
        });
        throw new Error(
          `CSV import failed at row ${i}: ${error_message}`,
        );
      }
    }

    const duration_ms = Date.now() - start;

    await log_to_history({
      operation_type: "import_csv",
      table_name,
      status: "success",
      rows_affected: rows_imported,
      duration_ms,
      executed_by: user_id,
    });

    return { rows_imported, duration_ms };
  }

  async list_history(limit: number = 50) {
    return db
      .select()
      .from(database_history)
      .orderBy(desc(database_history.created_at))
      .limit(limit);
  }

  async get_job_definitions() {
    const job_defs = KNOWN_JOBS.map((job) => ({
      name: job.name,
      description: job.description,
      last_run: null as string | null,
      status: "idle" as string,
    }));

    const [history_rows] = await db
      .select()
      .from(database_history)
      .where(eq(database_history.operation_type, "job"))
      .orderBy(desc(database_history.created_at))
      .limit(200);

    for (const job of job_defs) {
      const job_entry = history_rows.find((row) => {
        const query = row.query ?? "";
        return query.includes(job.name);
      });

      if (job_entry) {
        job.last_run = job_entry.created_at;
        job.status = job_entry.status === "error" ? "error" : "idle";
      }
    }

    return job_defs;
  }

  async trigger_job(
    job_name: string,
    user_id?: string,
  ): Promise<JobTriggerResult> {
    const start = Date.now();

    try {
      if (job_name === "soft-delete-cleanup") {
        const { soft_delete_cleanup_service } = await import(
          "@/lib/db/soft-delete-cleanup.service"
        );
        const result = await soft_delete_cleanup_service.runCleanup();
        const duration_ms = Date.now() - start;

        await log_to_history({
          operation_type: "job",
          query: `soft-delete-cleanup: ${JSON.stringify(result)}`,
          status: "success",
          duration_ms,
          executed_by: user_id,
        });

        return { job_name, status: "completed", duration_ms };
      }

      const duration_ms = Date.now() - start;

      await log_to_history({
        operation_type: "job",
        query: `${job_name}: not yet available for manual trigger`,
        status: "error",
        duration_ms,
        error_message: `Job "${job_name}" is not yet available for manual trigger`,
        executed_by: user_id,
      });

      return { job_name, status: "not_available", duration_ms };
    } catch (error) {
      const duration_ms = Date.now() - start;
      const error_message =
        error instanceof Error ? error.message : "Unknown error";

      await log_to_history({
        operation_type: "job",
        query: job_name,
        status: "error",
        duration_ms,
        error_message,
        executed_by: user_id,
      });

      logger.error("database_job_trigger_failed", {
        job_name,
        message: error_message,
      });

      throw new Error(error_message);
    }
  }
}

function parse_csv_line(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let in_quotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (in_quotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          in_quotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        in_quotes = true;
      } else if (char === ",") {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  values.push(current);
  return values;
}

export const database_management_service = new DatabaseManagementService();
