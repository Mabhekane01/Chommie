// services/authUser/src/app.ts
import express from 'express';
import 'express-async-errors';
import { baseConfig as config } from '@packages/config/env';
import { logger } from '@packages/config/logger';

import { sendOtpController } from '../src/twilioOtp/controllers/twilio-otp.controller.js';
import { verifyOtpController } from '../src/twilioOtp/controllers/twilio-otp.controller.js';

const app: express.Application = express();

// Basic middleware (since API Gateway handles most security)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logging (API Gateway handles detailed logging)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('AuthUser Request', {
      requestId: req.headers['x-request-id'],
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
});

// Health check (internal service health)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'authUser',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.nodeEnv,
  });
});

// Auth routes (no rate limiting since API Gateway handles it)
app.post('/api/send-otp', sendOtpController);
app.post('/api/verify-otp', verifyOtpController);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    service: 'authUser',
    requestId: req.headers['x-request-id'],
  });
});

// Simplified error handler (API Gateway handles global error formatting)
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error('AuthUser Service Error', {
      requestId: req.headers['x-request-id'],
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      message: config.app.isDevelopment
        ? error.message
        : 'Internal server error',
      service: 'authUser',
      requestId: req.headers['x-request-id'],
    });
  }
);

export default app;
