"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { extract_error_message } from "@/lib/error-detection";
import {
  Terminal,
  Download,
  Upload,
  Play,
  Loader2,
  ChevronRight,
  ChevronDown,
  FileText,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

export function DatabaseTab() {
  const t = useTranslations("settings");
  const [activeSection, setActiveSection] = useState("console");

  return (
    <Tabs value={activeSection} onValueChange={setActiveSection}>
      <TabsList variant="line" className="w-full flex-wrap">
        <TabsTrigger value="console" className="gap-1.5">
          <Terminal className="size-3.5" />
          {t("db_console")}
        </TabsTrigger>
        <TabsTrigger value="export" className="gap-1.5">
          <Download className="size-3.5" />
          {t("db_export")}
        </TabsTrigger>
        <TabsTrigger value="import" className="gap-1.5">
          <Upload className="size-3.5" />
          {t("db_import")}
        </TabsTrigger>
        <TabsTrigger value="jobs" className="gap-1.5">
          <Play className="size-3.5" />
          {t("db_jobs")}
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-1.5">
          <History className="size-3.5" />
          {t("db_history")}
        </TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="console">
          <SqlConsole />
        </TabsContent>
        <TabsContent value="export">
          <ExportSection />
        </TabsContent>
        <TabsContent value="import">
          <ImportSection />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsSection />
        </TabsContent>
        <TabsContent value="history">
          <HistorySection />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function SqlConsole() {
  const t = useTranslations("settings");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
    rows_affected: number;
    duration_ms: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute_mutation = trpc.database.executeQuery.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err) => {
      setError(extract_error_message(err) || t("db_execution_error"));
      setResult(null);
    },
  });

  const handle_execute = () => {
    if (!query.trim()) return;
    execute_mutation.mutate({ query: query.trim() });
  };

  const handle_keydown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handle_execute();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="size-4" />
          {t("db_console_title")}
        </CardTitle>
        <CardDescription>{t("db_console_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-1.5">{t("db_sql_query")}</Label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handle_keydown}
            placeholder="SELECT * FROM users LIMIT 10"
            className="border-input bg-input/30 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-30 w-full rounded-xl border px-3 py-2 font-mono text-sm outline-none focus-visible:ring-[3px]"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handle_execute} disabled={execute_mutation.isPending || !query.trim()}>
            {execute_mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Play className="size-4" data-icon="inline-start" />
            )}
            {t("db_execute")}
          </Button>
          <span className="text-muted-foreground text-xs">Ctrl+Enter</span>
        </div>

        {error && (
          <div className="border-destructive/20 bg-destructive/5 rounded-xl border p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {result.rows.length > 0
                  ? `${result.rows.length} ${t("db_rows_returned")}`
                  : `${result.rows_affected} ${t("db_rows_affected")}`}
              </span>
              <span className="text-muted-foreground">{result.duration_ms}ms</span>
            </div>
            {result.columns.length > 0 && (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      {result.columns.map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 100).map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {result.columns.map((col) => (
                          <td key={col} className="px-3 py-1.5 font-mono text-xs">
                            {format_cell_value(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.rows.length > 100 && (
                  <p className="text-muted-foreground p-2 text-center text-xs">
                    {t("db_showing_first")} 100 {t("db_of")} {result.rows.length}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExportSection() {
  const t = useTranslations("settings");
  const [selectedTable, setSelectedTable] = useState("");
  const [format, setFormat] = useState<"csv" | "sql" | "json">("csv");

  const tables_query = trpc.database.listTables.useQuery();
  const export_mutation = trpc.database.exportTable.useQuery(
    { table_name: selectedTable, format },
    { enabled: false },
  );

  const handle_export = useCallback(() => {
    if (!selectedTable) return;
    export_mutation.refetch().then(({ data }) => {
      if (data) {
        download_file(data.data, data.file_name, format);
        toast.success(`${t("db_export_success")}: ${data.row_count} ${t("db_rows")}`);
      }
    });
  }, [selectedTable, format, export_mutation, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="size-4" />
          {t("db_export_title")}
        </CardTitle>
        <CardDescription>{t("db_export_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5">{t("db_select_table")}</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="h-9 w-full rounded-full">
                <SelectValue placeholder={t("db_choose_table")} />
              </SelectTrigger>
              <SelectContent>
                {tables_query.data?.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5">{t("db_format")}</Label>
            <div className="flex gap-2">
              {(["csv", "sql", "json"] as const).map((f) => (
                <Button
                  key={f}
                  variant={format === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormat(f)}
                >
                  {f.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={handle_export} disabled={!selectedTable || export_mutation.isFetching}>
          {export_mutation.isFetching ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Download className="size-4" data-icon="inline-start" />
          )}
          {t("db_export")}
        </Button>
      </CardContent>
    </Card>
  );
}

function ImportSection() {
  const t = useTranslations("settings");
  const [mode, setMode] = useState<"sql" | "csv">("sql");
  const [sqlContent, setSqlContent] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [csvTable, setCsvTable] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const tables_query = trpc.database.listTables.useQuery();
  const utils = trpc.useUtils();

  const import_sql_mutation = trpc.database.importSql.useMutation({
    onSuccess: (data) => {
      toast.success(`${t("db_import_success")}: ${data.statements_executed} ${t("db_statements")}`);
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} ${t("db_errors")}`);
      }
      setSqlContent("");
      utils.database.history.invalidate();
    },
    onError: (err) => toast.error(extract_error_message(err) || t("db_import_error")),
  });

  const import_csv_mutation = trpc.database.importCsv.useMutation({
    onSuccess: (data) => {
      toast.success(`${t("db_import_success")}: ${data.rows_imported} ${t("db_rows")}`);
      setCsvContent("");
      utils.database.history.invalidate();
    },
    onError: (err) => toast.error(extract_error_message(err) || t("db_import_error")),
  });

  const handle_file = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (mode === "sql") {
        setSqlContent(content);
      } else {
        setCsvContent(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-4" />
          {t("db_import_title")}
        </CardTitle>
        <CardDescription>{t("db_import_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={mode === "sql" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("sql")}
          >
            SQL
          </Button>
          <Button
            variant={mode === "csv" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("csv")}
          >
            CSV
          </Button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={mode === "sql" ? ".sql,.txt" : ".csv"}
          onChange={handle_file}
          className="hidden"
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <FileText className="size-4" data-icon="inline-start" />
          {t("db_upload_file")}
        </Button>

        {mode === "sql" ? (
          <div>
            <Label className="mb-1.5">{t("db_sql_content")}</Label>
            <textarea
              value={sqlContent}
              onChange={(e) => setSqlContent(e.target.value)}
              placeholder="CREATE TABLE ... ; INSERT INTO ... ;"
              className="border-input bg-input/30 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-40 w-full rounded-xl border px-3 py-2 font-mono text-sm outline-none focus-visible:ring-[3px]"
              spellCheck={false}
            />
            <Button
              className="mt-3"
              onClick={() => import_sql_mutation.mutate({ sql_content: sqlContent })}
              disabled={!sqlContent.trim() || import_sql_mutation.isPending}
            >
              {import_sql_mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <Upload className="size-4" data-icon="inline-start" />
              )}
              {t("db_import_sql")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5">{t("db_target_table")}</Label>
              <Select value={csvTable} onValueChange={setCsvTable}>
                <SelectTrigger className="h-9 w-full rounded-full">
                  <SelectValue placeholder={t("db_choose_table")} />
                </SelectTrigger>
                <SelectContent>
                  {tables_query.data?.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">{t("db_csv_content")}</Label>
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="col1,col2,col3&#10;val1,val2,val3"
                className="border-input bg-input/30 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-30 w-full rounded-xl border px-3 py-2 font-mono text-sm outline-none focus-visible:ring-[3px]"
                spellCheck={false}
              />
            </div>
            <Button
              onClick={() =>
                import_csv_mutation.mutate({ table_name: csvTable, csv_content: csvContent })
              }
              disabled={!csvTable || !csvContent.trim() || import_csv_mutation.isPending}
            >
              {import_csv_mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <Upload className="size-4" data-icon="inline-start" />
              )}
              {t("db_import_csv")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobsSection() {
  const t = useTranslations("settings");
  const utils = trpc.useUtils();

  const jobs_query = trpc.database.listJobs.useQuery();

  const trigger_mutation = trpc.database.triggerJob.useMutation({
    onSuccess: (data) => {
      if (data.status === "completed") {
        toast.success(`${data.job_name}: ${t("db_job_completed")} (${data.duration_ms}ms)`);
      } else {
        toast.warning(`${data.job_name}: ${data.status}`);
      }
      utils.database.listJobs.invalidate();
      utils.database.history.invalidate();
    },
    onError: (err) => toast.error(extract_error_message(err) || t("db_job_error")),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="size-4" />
          {t("db_jobs_title")}
        </CardTitle>
        <CardDescription>{t("db_jobs_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs_query.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}
        {jobs_query.data?.map((job) => (
          <div key={job.name} className="flex items-center justify-between rounded-xl border p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{job.name}</p>
              <p className="text-muted-foreground text-xs">{job.description}</p>
              {job.last_run && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {t("db_last_run")}: {new Date(job.last_run).toLocaleString("fr-FR")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {job.status === "error" && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="size-3" />
                  Error
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => trigger_mutation.mutate({ job_name: job.name })}
                disabled={trigger_mutation.isPending}
              >
                {trigger_mutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Play className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HistorySection() {
  const t = useTranslations("settings");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const history_query = trpc.database.history.useQuery({ limit: 50 });

  const status_icon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="size-3.5 text-green-500" />;
      case "error":
        return <XCircle className="size-3.5 text-red-500" />;
      case "partial":
        return <AlertTriangle className="size-3.5 text-yellow-500" />;
      default:
        return <Clock className="text-muted-foreground size-3.5" />;
    }
  };

  const type_badge = (type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "accent"
    > = {
      query: "default",
      export: "success",
      import_sql: "warning",
      import_csv: "warning",
      job: "accent",
    };
    return (
      <Badge variant={variants[type] ?? "secondary"} className="text-xs">
        {type}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" />
          {t("db_history_title")}
        </CardTitle>
        <CardDescription>{t("db_history_description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {history_query.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}
        {history_query.data && history_query.data.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">{t("db_no_history")}</p>
        )}
        <div className="space-y-1">
          {history_query.data?.map((entry) => (
            <div key={entry.id} className="rounded-xl border">
              <button
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                {expandedId === entry.id ? (
                  <ChevronDown className="size-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="size-3.5 shrink-0" />
                )}
                {status_icon(entry.status)}
                {type_badge(entry.operation_type)}
                <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">
                  {entry.query ? entry.query.slice(0, 80) : (entry.table_name ?? "—")}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {entry.duration_ms ? `${entry.duration_ms}ms` : ""}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {new Date(entry.created_at).toLocaleString("fr-FR")}
                </span>
              </button>
              {expandedId === entry.id && (
                <div className="border-t px-3 py-2 text-xs">
                  {entry.query && (
                    <div className="mb-2">
                      <Label className="text-muted-foreground mb-1">{t("db_query")}</Label>
                      <pre className="bg-muted overflow-x-auto rounded-lg p-2 font-mono text-xs">
                        {entry.query}
                      </pre>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("db_status")}: </span>
                      {entry.status}
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("db_rows_affected")}: </span>
                      {entry.rows_affected ?? "—"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("db_duration")}: </span>
                      {entry.duration_ms ? `${entry.duration_ms}ms` : "—"}
                    </div>
                    {entry.error_message && (
                      <div className="col-span-2">
                        <span className="text-destructive">{entry.error_message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function format_cell_value(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return value.toLocaleString("fr-FR");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function download_file(content: string, file_name: string, format: string) {
  const mime_types: Record<string, string> = {
    csv: "text/csv",
    sql: "text/plain",
    json: "application/json",
  };
  const blob = new Blob([content], { type: mime_types[format] ?? "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file_name;
  a.click();
  URL.revokeObjectURL(url);
}
