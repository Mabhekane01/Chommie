import dotenv from 'dotenv';
import { z } from 'zod';
import ms, { StringValue } from 'ms';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the service's root directory (where the service is running from)
const serviceRootPath = process.cwd();

const loadEnvFiles = () => {
  const files = [
    path.join(serviceRootPath, '.env'),
    process.env.NODE_ENV &&
      path.join(serviceRootPath, `.env.${process.env.NODE_ENV}`),
    path.join(serviceRootPath, '.env.development'),
    path.join(serviceRootPath, '.env.production'),
  ].filter(Boolean) as string[];

  const loadedFiles: string[] = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file });
      loadedFiles.push(file);
      console.log(`✅ Loaded env file: ${file}`);
    }
  });

  return loadedFiles;
};

// Load environment files
const loaded = loadEnvFiles();
console.log('📁 Service root path:', serviceRootPath);
console.log('🔧 Total env files loaded:', loaded.length);

// Helper to validate time strings
const validateTimeString = (value: string): StringValue => {
  try {
    const parsed = ms(value as StringValue);
    if (typeof parsed !== 'number' || parsed <= 0) {
      throw new Error(`Invalid time format: ${value}`);
    }
    return value as StringValue;
  } catch (error) {
    throw new Error(
      `Invalid time format: ${value}. Use formats like '15m', '1h', '7d'`
    );
  }
};

// Base env schema — **no Twilio, no notification specific keys**
export const baseEnvSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).optional(),
  APP_NAME: z.string().optional(),
  APP_VERSION: z.string().default('1.0.0'),

  // Internationalization and Localization
  DEFAULT_LOCALE: z.string().default('en'),
  SUPPORTED_LOCALES: z.string().default('en,es,fr,de,it,pt,ja,ko,zh'),
  APP_TIMEZONE: z.string().default('UTC'),
  APP_COUNTRY_CODE: z.string().default('US'),

  // JWT Configuration (basic)
  JWT_SECRET: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  ACCESS_TOKEN_EXPIRY: z.string().default('30m').transform(validateTimeString),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d').transform(validateTimeString),

  JWT_ACCESS_EXPIRY: z.string().default('30m').transform(validateTimeString),
  JWT_REFRESH_EXPIRY: z.string().default('30d').transform(validateTimeString),
  JWT_ISSUER: z.string().default('api-gateway'),
  JWT_AUDIENCE: z.string().default('api-clients'),

  // Service URLs (generic)
  AUTH_SERVICE_URL: z.string().default('http://localhost:4001'),
  USER_SERVICE_URL: z.string().default('http://localhost:4002'),
  NOTIFICATION_SERVICE_URL: z.string().default('http://localhost:4003'),

  // Database
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_SSL: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  DB_POOL_MIN: z.string().transform(Number).default('2'),
  DB_POOL_MAX: z.string().transform(Number).default('10'),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_DB: z.string().transform(Number).default('0'),
  REDIS_TLS: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  REDIS_CONNECTION_NAME: z.string().optional().default('api-gateway'),
  REDIS_TTL: z.string().transform(Number).default('300'),
  REDIS_MAX_RETRIES: z.string().transform(Number).default('3'),
  REDIS_RETRY_DELAY: z.string().transform(Number).default('1000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_SKIP_SUCCESSFUL: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  AUTH_RATE_LIMIT_MAX: z.string().transform(Number).default('5'),
  STRICT_RATE_LIMIT_MAX: z.string().transform(Number).default('10'),

  // Proxy
  PROXY_TIMEOUT: z.string().transform(Number).default('30000'),
  PROXY_RESPONSE_TIMEOUT: z.string().transform(Number).default('30000'),
  PROXY_RETRY_ATTEMPTS: z.string().transform(Number).default('3'),
  PROXY_RETRY_DELAY: z.string().transform(Number).default('1000'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().optional(),
  CORS_CREDENTIALS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  CORS_MAX_AGE: z.string().transform(Number).default('86400'),

  // Security
  HELMET_CSP: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  TRUST_PROXY_HOPS: z.string().transform(Number).default('1'),
  BODY_LIMIT: z.string().default('10mb'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),
  LOG_FILE_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  LOG_FILE_PATH: z.string().default('./logs'),
  LOG_MAX_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.string().transform(Number).default('14'),

  // Health Check
  HEALTH_CHECK_TIMEOUT: z.string().transform(Number).default('5000'),
  HEALTH_CHECK_INTERVAL: z.string().transform(Number).default('30000'),

  // Metrics
  METRICS_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  METRICS_PORT: z.string().transform(Number).default('9090'),
  METRICS_PATH: z.string().default('/metrics'),

  // Circuit Breaker
  CIRCUIT_BREAKER_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  CIRCUIT_BREAKER_THRESHOLD: z.string().transform(Number).default('5'),
  CIRCUIT_BREAKER_TIMEOUT: z.string().transform(Number).default('60000'),
  CIRCUIT_BREAKER_RESET_TIMEOUT: z.string().transform(Number).default('30000'),

  // Graceful Shutdown
  SHUTDOWN_TIMEOUT: z.string().transform(Number).default('15000'),
  KEEP_ALIVE_TIMEOUT: z.string().transform(Number).default('5000'),

  // External APIs (generic, no Notification-specific here)
  SMS_PROVIDER_API_KEY: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
});

// Custom validation: Ensure at least one JWT secret provided
const validateJWTSecrets = (data: z.infer<typeof baseEnvSchema>) => {
  if (!data.JWT_SECRET && !data.JWT_ACCESS_SECRET && !data.JWT_REFRESH_SECRET) {
    throw new Error(
      'At least one JWT secret must be provided (JWT_SECRET, JWT_ACCESS_SECRET, or JWT_REFRESH_SECRET)'
    );
  }
  return data;
};

// Validate env now
const baseEnvValidation = baseEnvSchema.safeParse(process.env);
if (!baseEnvValidation.success) {
  console.error('❌ Environment validation failed:');
  console.table(
    baseEnvValidation.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }))
  );
  process.exit(1);
}

let baseEnv: z.infer<typeof baseEnvSchema>;
try {
  baseEnv = validateJWTSecrets(baseEnvValidation.data);
} catch (e) {
  console.error(
    '❌ Custom validation failed:',
    e instanceof Error ? e.message : e
  );
  process.exit(1);
}

console.log('✅ Using DB name:', baseEnv.DB_NAME);

// Export the validated env data
export { baseEnv };
// Export base config object
export const baseConfig = {
  app: {
    name: baseEnv.APP_NAME,
    version: baseEnv.APP_VERSION,
    port: baseEnv.PORT,
    nodeEnv: baseEnv.NODE_ENV,
    isDevelopment: baseEnv.NODE_ENV === 'development',
    isProduction: baseEnv.NODE_ENV === 'production',
    isStaging: baseEnv.NODE_ENV === 'staging',
    isTest: baseEnv.NODE_ENV === 'test',
  },
  locale: {
    default: baseEnv.DEFAULT_LOCALE,
    supported: baseEnv.SUPPORTED_LOCALES.split(',').map(l => l.trim()),
    timezone: baseEnv.APP_TIMEZONE,
    countryCode: baseEnv.APP_COUNTRY_CODE,
  },
  jwt: {
    secret:
      baseEnv.JWT_SECRET ||
      baseEnv.JWT_ACCESS_SECRET ||
      baseEnv.JWT_REFRESH_SECRET!,
    accessSecret:
      baseEnv.JWT_ACCESS_SECRET ||
      baseEnv.JWT_SECRET ||
      baseEnv.JWT_REFRESH_SECRET!,
    refreshSecret:
      baseEnv.JWT_REFRESH_SECRET ||
      baseEnv.JWT_SECRET ||
      baseEnv.JWT_ACCESS_SECRET!,
    accessTokenExpiry: baseEnv.ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: baseEnv.REFRESH_TOKEN_EXPIRY,
    accessExpiry: baseEnv.JWT_ACCESS_EXPIRY,
    refreshExpiry: baseEnv.JWT_REFRESH_EXPIRY,
    issuer: baseEnv.JWT_ISSUER,
    audience: baseEnv.JWT_AUDIENCE,
    algorithm: 'HS256' as const,
  },
  services: {
    auth: baseEnv.AUTH_SERVICE_URL,
    user: baseEnv.USER_SERVICE_URL,
    notification: baseEnv.NOTIFICATION_SERVICE_URL || '', // empty string if not set
  },
  database: {
    url: baseEnv.DATABASE_URL,
    host: baseEnv.DB_HOST,
    port: baseEnv.DB_PORT,
    name: baseEnv.DB_NAME || 'api_gateway_db',

    user: baseEnv.DB_USER || 'postgres',
    password: baseEnv.DB_PASSWORD || '',
    ssl: baseEnv.DB_SSL,
    pool: {
      min: baseEnv.DB_POOL_MIN,
      max: baseEnv.DB_POOL_MAX,
    },
  },
  redis: {
    url: baseEnv.REDIS_URL,
    host: baseEnv.REDIS_HOST,
    port: baseEnv.REDIS_PORT,
    password: baseEnv.REDIS_PASSWORD || undefined,
    db: baseEnv.REDIS_DB,
    tls: baseEnv.REDIS_TLS,
    connectionName: baseEnv.REDIS_CONNECTION_NAME,
    ttl: baseEnv.REDIS_TTL,
    maxRetries: baseEnv.REDIS_MAX_RETRIES,
    retryDelayOnFailover: baseEnv.REDIS_RETRY_DELAY,
    lazyConnect: true,
    keepAlive: 30000,
    maxRetriesPerRequest: 3,
  },
  rateLimit: {
    windowMs: baseEnv.RATE_LIMIT_WINDOW,
    maxRequests: baseEnv.RATE_LIMIT_MAX,
    skipSuccessfulRequests: baseEnv.RATE_LIMIT_SKIP_SUCCESSFUL,
    auth: {
      windowMs: 60000,
      max: baseEnv.AUTH_RATE_LIMIT_MAX,
    },
    strict: {
      windowMs: 60000,
      max: baseEnv.STRICT_RATE_LIMIT_MAX,
    },
  },
  proxy: {
    timeout: baseEnv.PROXY_TIMEOUT,
    proxyTimeout: baseEnv.PROXY_RESPONSE_TIMEOUT,
    retryAttempts: baseEnv.PROXY_RETRY_ATTEMPTS,
    retryDelay: baseEnv.PROXY_RETRY_DELAY,
    changeOrigin: true,
    followRedirects: false,
    secure: baseEnv.NODE_ENV === 'production',
  },
  cors: {
    origin: (baseEnv.ALLOWED_ORIGINS || baseEnv.CORS_ORIGIN)
      .split(',')
      .map(origin => origin.trim()),
    credentials: baseEnv.CORS_CREDENTIALS,
    optionsSuccessStatus: 200,
    maxAge: baseEnv.CORS_MAX_AGE,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
      'X-API-Key',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
    ],
  },
  security: {
    helmet: {
      contentSecurityPolicy:
        baseEnv.HELMET_CSP && baseEnv.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
      hsts: baseEnv.NODE_ENV === 'production',
    },
    trustProxy: baseEnv.TRUST_PROXY_HOPS,
    bodyLimit: baseEnv.BODY_LIMIT,
  },
  logging: {
    level: baseEnv.LOG_LEVEL,
    format: baseEnv.LOG_FORMAT,
    file: {
      enabled: baseEnv.LOG_FILE_ENABLED,
      path: baseEnv.LOG_FILE_PATH,
      maxSize: baseEnv.LOG_MAX_SIZE,
      maxFiles: baseEnv.LOG_MAX_FILES,
    },
    console: {
      enabled: true,
      colorize: baseEnv.NODE_ENV === 'development',
    },
  },
  healthCheck: {
    timeout: baseEnv.HEALTH_CHECK_TIMEOUT,
    interval: baseEnv.HEALTH_CHECK_INTERVAL,
    retries: 3,
  },
  metrics: {
    enabled: baseEnv.METRICS_ENABLED,
    port: baseEnv.METRICS_PORT,
    path: baseEnv.METRICS_PATH,
    collectDefaultMetrics: true,
  },
  circuitBreaker: {
    enabled: baseEnv.CIRCUIT_BREAKER_ENABLED,
    threshold: baseEnv.CIRCUIT_BREAKER_THRESHOLD,
    timeout: baseEnv.CIRCUIT_BREAKER_TIMEOUT,
    resetTimeout: baseEnv.CIRCUIT_BREAKER_RESET_TIMEOUT,
    monitoringPeriod: 10000,
  },
  shutdown: {
    timeout: baseEnv.SHUTDOWN_TIMEOUT,
    keepAliveTimeout: baseEnv.KEEP_ALIVE_TIMEOUT,
    headersTimeout: baseEnv.KEEP_ALIVE_TIMEOUT + 1000,
  },
  externalApis: {
    sms: baseEnv.SMS_PROVIDER_API_KEY,
    email: baseEnv.EMAIL_PROVIDER_API_KEY,
  },
  monitoring: {
    sentry: baseEnv.SENTRY_DSN,
    newRelic: baseEnv.NEW_RELIC_LICENSE_KEY,
    datadog: baseEnv.DATADOG_API_KEY,
  },
};

export type BaseConfig = typeof baseConfig;

// Export individual configs for convenience (backward compatibility)
export const dbConfig = {
  host: baseConfig.database.host,
  port: baseConfig.database.port,
  user: baseConfig.database.user,
  password: baseConfig.database.password,
  database: baseConfig.database.name,
};

// Update this section in your Redis config (@packages/redis/index.ts)

// Create Redis configuration using centralized config
export const redisConfig = {
  host: baseConfig.redis.host,
  port: baseConfig.redis.port,
  password: baseConfig.redis.password,
  db: baseConfig.redis.db,

  // Connection pool settings
  maxRetriesPerRequest: baseConfig.redis.maxRetriesPerRequest,
  enableReadyCheck: true,

  // Connection management
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: baseConfig.redis.lazyConnect,
  keepAlive: baseConfig.redis.keepAlive,

  // IMPORTANT: Enable offline queue for rate limiter compatibility
  // This allows commands to be queued while connection is being established
  enableOfflineQueue: true, // Changed from false to true

  // Alternative: You can set maxRetriesPerRequest to null to allow unlimited retries
  // maxRetriesPerRequest: null,

  // Retry strategy
  retryStrategy: (times: number): number | null => {
    if (times > baseConfig.redis.maxRetries) {
      return null; // Stop retrying after max attempts
    }
    // Use retryDelayOnFailover from config for delay calculation
    const delay = Math.min(times * 50, baseConfig.redis.retryDelayOnFailover);
    console.warn(
      `Redis retry attempt ${times}/${baseConfig.redis.maxRetries}, waiting ${delay}ms`
    );
    return delay;
  },

  // Connection name for monitoring
  connectionName: baseConfig.redis.connectionName,

  // TLS support
  ...(baseConfig.redis.tls && {
    tls: {
      rejectUnauthorized: baseConfig.app.isProduction,
    },
  }),
};

export const jwtConfig = {
  accessSecret: baseConfig.jwt.accessSecret,
  refreshSecret: baseConfig.jwt.refreshSecret,
  accessTokenExpiry: baseConfig.jwt.accessTokenExpiry,
  refreshTokenExpiry: baseConfig.jwt.refreshTokenExpiry,
};

export const logConfig = {
  level: baseConfig.logging.level,
  format: baseConfig.logging.format,
  filePath: baseConfig.logging.file.path,
  maxFiles: baseConfig.logging.file.maxFiles,
  maxSize: baseConfig.logging.file.maxSize,
};

// If you have a twilio config, define it in baseConfig and export it here. Otherwise, remove this line or implement as needed.
// export const twilioConfig = baseConfig.twilio;

if (baseConfig.app.isDevelopment) {
  // Log config safely on dev start (excluding secrets)
  const safeConfig = {
    ...baseConfig,
    jwt: {
      ...baseConfig.jwt,
      secret: baseConfig.jwt.secret ? '[REDACTED]' : undefined,
      accessSecret: baseConfig.jwt.accessSecret ? '[REDACTED]' : undefined,
      refreshSecret: baseConfig.jwt.refreshSecret ? '[REDACTED]' : undefined,
    },
    database: {
      ...baseConfig.database,
      password: baseConfig.database.password ? '[REDACTED]' : undefined,
    },
    redis: {
      ...baseConfig.redis,
      password: baseConfig.redis.password ? '[REDACTED]' : undefined,
    },
    externalApis: Object.entries(baseConfig.externalApis).reduce(
      (acc, [key, val]) => {
        acc[key as keyof typeof baseConfig.externalApis] = val
          ? '[REDACTED]'
          : undefined;
        return acc;
      },
      {} as Record<keyof typeof baseConfig.externalApis, string | undefined>
    ),
    monitoring: {
      sentry: baseEnv.SENTRY_DSN ? '[REDACTED]' : undefined,
      newRelic: baseEnv.NEW_RELIC_LICENSE_KEY ? '[REDACTED]' : undefined,
      datadog: baseEnv.DATADOG_API_KEY ? '[REDACTED]' : undefined,
    },
  };

  console.log(
    '📋 Base Configuration loaded:',
    JSON.stringify(safeConfig, null, 2)
  );
}
