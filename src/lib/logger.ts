// Simple structured logger. In production you could swap this with pino or another logger.
// Usage: logAuth('event_name', { key: 'value' })
// Each log line is JSON to ease ingestion by log processors.

type LogLevel = 'info' | 'warn' | 'error';

interface BaseLog {
  ts: string; // ISO timestamp
  level: LogLevel;
  area: 'auth' | 'app';
  event: string;
  msg?: string;
}

export function logAuth(event: string, meta: Record<string, any> = {}, level: LogLevel = 'info', msg?: string) {
  const line: BaseLog & Record<string, any> = {
    ts: new Date().toISOString(),
    level,
    area: 'auth',
    event,
    ...meta,
  };
  if (msg) line.msg = msg;
  // eslint-disable-next-line no-console
  console[level](JSON.stringify(line));
}

export function logApp(event: string, meta: Record<string, any> = {}, level: LogLevel = 'info', msg?: string) {
  const line: BaseLog & Record<string, any> = {
    ts: new Date().toISOString(),
    level,
    area: 'app',
    event,
    ...meta,
  };
  if (msg) line.msg = msg;
  // eslint-disable-next-line no-console
  console[level](JSON.stringify(line));
}
