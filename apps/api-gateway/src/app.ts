//api-gateway/src/app.ts

/**
 * Express Application Setup
 *
 * - Creates and configures the main Express app instance.
 * - Sets trust proxy for correct client IP handling.
 * - Applies security middleware (Helmet) and CORS with configured options.
 * - Enables response compression and body parsing with size limits.
 * - Attaches unique request IDs and logs incoming requests.
 * - Applies global rate limiting and authentication middleware.
 * - Defines a simple health check endpoint at `/health`.
 * - Mounts main API routes under `/api`.
 * - Adds 404 (not found) and generic error handlers at the end.
 * - Notes that graceful shutdown is handled separately in the server startup.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { baseConfig as config } from '@packages/config/env'; // Updated import path
import { attachRequestId } from './middlewares/requestId.js';
import { authMiddleware } from './middlewares/auth.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { globalRateLimit } from './middlewares/rateLimiter.js';
import { router } from './routes/routes.js';

export const app: express.Application = express();

// Trust proxy for accurate client IP
app.set('trust proxy', config.security.trustProxy);

// Security middleware
app.use(helmet(config.security.helmet));

// CORS
app.use(cors(config.cors));

// Compression
app.use(compression);

// Body parsing
app.use(express.json({ limit: config.security.bodyLimit }));
app.use(
  express.urlencoded({ extended: true, limit: config.security.bodyLimit })
);

// Request processing
app.use(attachRequestId);
app.use(requestLogger);

// Rate limiting
app.use(globalRateLimit);

// Authentication
app.use(authMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.nodeEnv,
    version: config.app.version,
    name: config.app.name,
  });
});

// Routes
app.use('/api', router);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Note: Graceful shutdown handling has been moved to the server startup file
// to avoid duplicate handlers and better separation of concerns
