// shared/config/logger.ts

/*
Keeps track of what happens in the app (messages, errors, warnings, info, debug)

Saves logs both on the screen (console) and in files (rotated daily)

Shows colorful logs when you develop locally

Keeps logs safe by hiding sensitive info like phone numbers and emails when in production

Lets you add extra info to logs, like user ID, request ID, and timestamps, to help find problems

Has helpers to log HTTP requests, errors, and performance easily
*/
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { baseEnv as env, logConfig } from './env.js';

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(logColors);

// Custom format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    // Add stack trace if present
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// Custom format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(info => {
    // Sanitize sensitive data
    const sanitized = { ...info };

    // Remove or mask sensitive fields
    if (typeof sanitized.phoneNumber === 'string') {
      sanitized.phoneNumber = sanitized.phoneNumber.substring(0, 4) + '***';
    }

    if (typeof sanitized.email === 'string') {
      const [user, domain] = sanitized.email.split('@');
      sanitized.email = `${user.substring(0, 2)}***@${domain}`;
    }

    // Remove JWT tokens from logs
    delete sanitized.accessToken;
    delete sanitized.refreshToken;
    delete sanitized.token;

    return JSON.stringify(sanitized);
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport
transports.push(
  new winston.transports.Console({
    level: logConfig.level,
    format:
      env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    handleExceptions: true,
    handleRejections: true,
  })
);

// File transports for production
if (env.NODE_ENV === 'production' && logConfig.filePath) {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: `${logConfig.filePath}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: logConfig.maxFiles,
      maxSize: logConfig.maxSize,
      format: productionFormat,
      handleExceptions: true,
      handleRejections: true,
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: `${logConfig.filePath}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxFiles: logConfig.maxFiles,
      maxSize: logConfig.maxSize,
      format: productionFormat,
    })
  );

  // Info logs
  transports.push(
    new DailyRotateFile({
      filename: `${logConfig.filePath}/info-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: logConfig.maxFiles,
      maxSize: logConfig.maxSize,
      format: productionFormat,
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  levels: logLevels,
  level: logConfig.level,
  format: winston.format.errors({ stack: true }),
  transports,
  exitOnError: false,
});

// Create typed logger interface for better development experience
interface LogContext {
  requestId?: string;
  userId?: string;
  phoneNumber?: string;
  email?: string;
  timestamp?: string;
  duration?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  status?: number;
  error?: string;
  stack?: string;
  [key: string]: any;
}

interface TypedLogger {
  error(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

// Wrap the logger with type safety
const typedLogger: TypedLogger = {
  error: (message: string, context?: LogContext) => {
    logger.error(message, context);
  },
  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context);
  },
  info: (message: string, context?: LogContext) => {
    logger.info(message, context);
  },
  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context);
  },
};

// Export both the original logger and typed version
export { typedLogger };
export default typedLogger;

// Utility function to create child logger with consistent context
export const createChildLogger = (defaultContext: LogContext) => {
  return {
    error: (message: string, context?: LogContext) => {
      logger.error(message, { ...defaultContext, ...context });
    },
    warn: (message: string, context?: LogContext) => {
      logger.warn(message, { ...defaultContext, ...context });
    },
    info: (message: string, context?: LogContext) => {
      logger.info(message, { ...defaultContext, ...context });
    },
    debug: (message: string, context?: LogContext) => {
      logger.debug(message, { ...defaultContext, ...context });
    },
  };
};

// Performance monitoring helper
export const logPerformance = (
  operation: string,
  startTime: number,
  context?: LogContext
) => {
  const duration = Date.now() - startTime;
  const level = duration > 1000 ? 'warn' : 'info';

  logger.log(level, `Performance: ${operation}`, {
    ...context,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
};

// HTTP request logging helper
export const logHttpRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context?: LogContext
) => {
  const level = statusCode >= 400 ? 'warn' : 'info';

  logger.log(level, `HTTP ${method} ${url}`, {
    ...context,
    method,
    url,
    status: statusCode,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
};

// Error boundary helper
export const logError = (error: Error, context?: LogContext) => {
  logger.error(error.message, {
    ...context,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

// Initialize logger on startup
logger.info('Logger initialized', {
  level: logConfig.level,
  format: logConfig.format,
  environment: env.NODE_ENV,
  timestamp: new Date().toISOString(),
});
