type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  name: string;
  correlationId?: string;
  message: string;
  data?: Record<string, unknown>;
}

function emit(entry: LogEntry): void {
  const line = JSON.stringify(entry);
  switch (entry.level) {
    case "error":
      process.stderr.write(line + "\n");
      break;
    default:
      process.stdout.write(line + "\n");
  }
}

export interface Logger {
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
}

export function createLogger(name: string): Logger {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    emit({
      timestamp: new Date().toISOString(),
      level,
      name,
      message,
      data,
    });
  }

  return {
    info: (message, data) => log("info", message, data),
    warn: (message, data) => log("warn", message, data),
    error: (message, data) => log("error", message, data),
  };
}

export function redact(value: string, maxLen = 40): string {
  if (value.length <= 4) return "[redacted]";
  return value.substring(0, 4) + "..." + value.substring(value.length - 4);
}
