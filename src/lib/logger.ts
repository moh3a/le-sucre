import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logDirectory = path.join(process.cwd(), "logs");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// In development, display colorized messages; in production, use standard JSON logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  process.env.NODE_ENV === "production"
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ""}`
        )
      )
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
];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format,
  transports,
  exitOnError: false,
});

export default logger;
