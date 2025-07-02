// src/routes/health.ts

/**
 * Health Router
 *
 * - Provides basic and detailed health check endpoints for the app.
 * - `GET /health`: Returns simple status, uptime, and request ID.
 * - `GET /health/detailed`: Checks status of database, cache, and external services.
 * - Detailed check returns overall health status and individual check results.
 * - Uses async helper functions to verify database connectivity, cache functionality, and service availability.
 * - Responds with HTTP 200 if all systems are healthy, otherwise HTTP 503.
 * - Includes error handling for all health checks.
 * - Supports request tracing using `requestId`.
 */

import { Router, Request, Response } from 'express';
import { baseConfig as config } from '@packages/config/env';
import { cache } from '../utils/cache.js';
import { checkDatabaseHealth } from '@packages/database';
import axios from 'axios';

export const healthRouter: Router = Router();

interface HealthCheckResult {
  status: 'OK' | 'FAIL';
  [key: string]: any;
}

// Basic health check
healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requestId: req.requestId,
  });
});

// Detailed health check
healthRouter.get('/detailed', async (req: Request, res: Response) => {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    services: await checkServices(),
  };

  const isHealthy = Object.values(checks).every(check => {
    // Handle both single check results and service check objects
    if (typeof check === 'object' && 'status' in check) {
      return check.status === 'OK';
    }
    // Handle services object
    if (typeof check === 'object' && !('status' in check)) {
      return Object.values(check).every(
        (service: any) => service.status === 'OK'
      );
    }
    return false;
  });

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    checks,
    requestId: req.requestId,
  });
});

async function checkCache(): Promise<HealthCheckResult> {
  try {
    await cache.set('health_check', 'ok', 10);
    const result = await cache.get('health_check');
    await cache.del('health_check');
    return { status: result === 'ok' ? 'OK' : 'FAIL' };
  } catch (error) {
    return { status: 'FAIL', error: (error as Error).message };
  }
}

async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const healthResult = await checkDatabaseHealth();

    if (healthResult.status === 'healthy') {
      return {
        status: 'OK',
        latency: healthResult.latency ? `${healthResult.latency}ms` : 'N/A',
        poolStats: healthResult.poolStats,
        timestamp: healthResult.timestamp,
      };
    } else {
      return {
        status: 'FAIL',
        error: healthResult.error,
        timestamp: healthResult.timestamp,
      };
    }
  } catch (error) {
    return {
      status: 'FAIL',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkServices(): Promise<Record<string, HealthCheckResult>> {
  const services = Object.entries(config.services);
  const results: Record<string, HealthCheckResult> = {};

  await Promise.all(
    services.map(async ([name, url]) => {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${url}/health`, {
          timeout: config.healthCheck.timeout,
        });
        const responseTime = Date.now() - startTime;

        results[name] = {
          status: 'OK',
          responseTime:
            response.headers['x-response-time'] || `${responseTime}ms`,
          url: url,
        };
      } catch (error) {
        results[name] = {
          status: 'FAIL',
          error: (error as Error).message,
          url: url,
        };
      }
    })
  );

  return results;
}
