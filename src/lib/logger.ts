import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { redact } from "@/lib/security/redaction";

const logDirectory = path.join(process.cwd(), "logs");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  audit: 5,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
  audit: "blue",
};

winston.addColors(colors);

const redact_format = winston.format((info) => {
  if (info.metadata) info.metadata = redact(info.metadata);
  if (info.err) info.err = redact(info.err);
  if (info.stack) info.stack = "[REDACTED]";
  if (info.headers) info.headers = redact(info.headers);
  if (info.body) {
    const safe = redact(info.body);
    if (typeof safe === "string") info.body = safe.substring(0, 1000);
    else info.body = safe;
  }
  return info;
});

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: false }),
  redact_format(),
  process.env.NODE_ENV === "production"
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) =>
            `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ""}`,
        ),
      ),
);

const transports: winston.transport[] = [
  new winston.transports.Console(),
  new DailyRotateFile({
    filename: path.join(logDirectory, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
  }),
  new DailyRotateFile({
    filename: path.join(logDirectory, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "40m",
    maxFiles: "14d",
  }),
  new DailyRotateFile({
    filename: path.join(logDirectory, "audit-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "40m",
    maxFiles: "90d",
    level: "audit",
  }),
];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format,
  transports,
  exitOnError: false,
});

export function audit_log(
  actor: string | null,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>,
) {
  logger.log("audit", `${action} on ${resource}`, {
    metadata: { actor, action, resource, ...(metadata ? redact(metadata) : {}) },
  });
}

export default logger;
