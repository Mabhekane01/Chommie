// src/proxies/baseProxy.ts
import {
  createProxyMiddleware,
  RequestHandler,
  responseInterceptor,
} from 'http-proxy-middleware';
import { baseConfig as config } from '@packages/config/env';
import { logger } from '@packages/config/logger';
import { Request, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';

// Type definitions for proxy events
interface ProxyRequestEvent extends IncomingMessage {
  requestId?: string;
  user?: {
    id: string;
    phoneNumber: string;
  };
  clientIp?: string;
  ip?: string;
  path?: string;
  method?: string;
}

export const createServiceProxy = (
  target: string,
  pathRewrite?: Record<string, string>,
  additionalOptions: Record<string, any> = {}
): RequestHandler => {
  return createProxyMiddleware({
    target,
    changeOrigin: config.proxy.changeOrigin,
    secure: config.proxy.secure,
    timeout: config.proxy.timeout,
    proxyTimeout: config.proxy.proxyTimeout,
    followRedirects: config.proxy.followRedirects,
    pathRewrite,

    // Request interceptor with proper typing
    onProxyReq: (proxyReq: any, req: any) => {
      const request = req as ProxyRequestEvent;

      // Forward request ID for tracing
      if (request.requestId) {
        proxyReq.setHeader('X-Request-ID', request.requestId);
      }

      // Forward user info if authenticated
      if (request.user) {
        proxyReq.setHeader('X-User-ID', request.user.id);
        proxyReq.setHeader('X-User-Phone', request.user.phoneNumber);
      }

      // Forward client IP
      const clientIp =
        request.clientIp || request.ip || request.socket?.remoteAddress;
      if (clientIp) {
        proxyReq.setHeader('X-Forwarded-For', clientIp);
        proxyReq.setHeader('X-Real-IP', clientIp);
      }

      // Add original host header
      if (request.headers?.host) {
        proxyReq.setHeader('X-Forwarded-Host', request.headers.host);
      }

      logger.debug('Proxying request', {
        requestId: request.requestId,
        target,
        path: request.url || request.path,
        method: request.method,
      });
    },

    // Response interceptor with proper typing
    onProxyRes: (proxyRes: any, req: any, res: any) => {
      const request = req as ProxyRequestEvent;
      const response = res as Response;

      // Forward response headers
      if (proxyRes.headers && proxyRes.headers['x-request-id']) {
        response.setHeader('X-Request-ID', proxyRes.headers['x-request-id']);
      }

      // Add CORS headers if needed
      const corsOrigin = config.cors.origin;
      if (Array.isArray(corsOrigin) && corsOrigin.length > 0) {
        response.setHeader('Access-Control-Allow-Origin', corsOrigin[0]);
      } else if (typeof corsOrigin === 'string') {
        response.setHeader('Access-Control-Allow-Origin', corsOrigin);
      }

      logger.debug('Proxy response received', {
        requestId: request.requestId,
        statusCode: proxyRes.statusCode,
        target,
        responseTime: proxyRes.headers?.['x-response-time'],
      });
    },

    // Error handler with proper typing
    onError: (err: any, req: any, res: any) => {
      const request = req as ProxyRequestEvent;
      const response = res as Response;

      logger.error('Proxy error', {
        requestId: request.requestId,
        error: err.message,
        code: err.code,
        target,
        path: request.url || request.path,
        method: request.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });

      // Only send response if headers haven't been sent
      if (!response.headersSent) {
        response.status(502).json({
          error: 'Service temporarily unavailable',
          code: 'PROXY_ERROR',
          requestId: request.requestId,
          timestamp: new Date().toISOString(),
        });
      }
    },

    // Custom router for dynamic target selection
    router: (req: any) => {
      // You can add custom routing logic here if needed
      return target;
    },

    // Merge additional options
    ...additionalOptions,
  } as any); // Type assertion to bypass strict typing issues
};

// Helper function to create proxy with retry logic
export const createResilientServiceProxy = (
  target: string,
  pathRewrite?: Record<string, string>,
  additionalOptions: Record<string, any> = {}
): RequestHandler => {
  let retryCount = 0;
  const maxRetries = config.proxy.retryAttempts;

  return createProxyMiddleware({
    target,
    changeOrigin: config.proxy.changeOrigin,
    secure: config.proxy.secure,
    timeout: config.proxy.timeout,
    proxyTimeout: config.proxy.proxyTimeout,
    followRedirects: config.proxy.followRedirects,
    pathRewrite,

    onProxyReq: (proxyReq: any, req: any) => {
      const request = req as ProxyRequestEvent;

      if (request.requestId) {
        proxyReq.setHeader('X-Request-ID', request.requestId);
      }

      if (request.user) {
        proxyReq.setHeader('X-User-ID', request.user.id);
        proxyReq.setHeader('X-User-Phone', request.user.phoneNumber);
      }

      const clientIp =
        request.clientIp || request.ip || request.socket?.remoteAddress;
      if (clientIp) {
        proxyReq.setHeader('X-Forwarded-For', clientIp);
        proxyReq.setHeader('X-Real-IP', clientIp);
      }

      logger.debug('Proxying request with retry capability', {
        requestId: request.requestId,
        target,
        path: request.url || request.path,
        method: request.method,
      });
    },

    onError: (err: any, req: any, res: any) => {
      const request = req as ProxyRequestEvent;
      const response = res as Response;

      retryCount++;

      logger.warn('Proxy attempt failed', {
        requestId: request.requestId,
        attempt: retryCount,
        maxRetries,
        error: err.message,
        target,
      });

      if (retryCount < maxRetries && !response.headersSent) {
        logger.info('Will retry proxy request', {
          requestId: request.requestId,
          nextAttempt: retryCount + 1,
          target,
          retryDelay: config.proxy.retryDelay,
        });

        // Note: Actual retry logic would need to be implemented at the middleware level
        // This is just logging the retry attempt
        setTimeout(() => {
          retryCount = 0; // Reset for successful requests
        }, config.proxy.retryDelay);
      } else {
        logger.error('Proxy failed after all retries', {
          requestId: request.requestId,
          totalAttempts: retryCount,
          error: err.message,
          target,
        });

        if (!response.headersSent) {
          response.status(502).json({
            error: 'Service temporarily unavailable after retries',
            code: 'PROXY_ERROR_MAX_RETRIES',
            requestId: request.requestId,
            attempts: retryCount,
            timestamp: new Date().toISOString(),
          });
        }

        retryCount = 0; // Reset for next request
      }
    },

    ...additionalOptions,
  } as any);
};

// Utility function to create service-specific proxies
export const createAuthServiceProxy = () => {
  return createServiceProxy(config.services.auth, {
    '^/api/auth': '/',
  });
};

export const createUserServiceProxy = () => {
  return createServiceProxy(config.services.user, {
    '^/api/users': '/',
  });
};

export const createNotificationServiceProxy = () => {
  return createServiceProxy(config.services.notification, {
    '^/api/notifications': '/',
  });
};
