/**
 * Centralized error reporting utility
 * Ensures errors are never swallowed silently
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type ErrorContext = {
  component?: string;
  action?: string;
  gamepadIndex?: number;
  [key: string]: unknown;
};

/**
 * Report an error with context
 * In production, this could send to a telemetry service
 */
export const reportError = (
  error: unknown,
  severity: ErrorSeverity = 'error',
  context?: ErrorContext
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    timestamp: new Date().toISOString(),
    severity,
    message: errorMessage,
    stack: errorStack,
    ...context,
  };

  // Always log to console in development
  switch (severity) {
    case 'info':
      console.info('[JoyScope]', logData);
      break;
    case 'warning':
      console.warn('[JoyScope]', logData);
      break;
    case 'error':
    case 'critical':
      console.error('[JoyScope]', logData);
      break;
  }

  // In production, could send to telemetry endpoint here
  // if (import.meta.env.PROD && telemetryEnabled) { ... }
};

/**
 * Wrap an async function with error reporting
 */
export const withErrorReporting = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
): ((...args: T) => Promise<R | undefined>) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      reportError(error, 'error', context);
      return undefined;
    }
  };
};

/**
 * Safe JSON parse with error reporting
 */
export const safeJsonParse = <T>(
  json: string,
  fallback: T,
  context?: ErrorContext
): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    reportError(error, 'warning', { ...context, action: 'JSON.parse' });
    return fallback;
  }
};

/**
 * Safe localStorage access with error reporting
 * Handles private browsing mode and quota errors
 */
export const safeLocalStorage = {
  getItem: (key: string, fallback: string | null = null): string | null => {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch (error) {
      reportError(error, 'warning', { action: 'localStorage.getItem', key });
      return fallback;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      reportError(error, 'warning', { action: 'localStorage.setItem', key });
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      reportError(error, 'warning', { action: 'localStorage.removeItem', key });
      return false;
    }
  },
};

