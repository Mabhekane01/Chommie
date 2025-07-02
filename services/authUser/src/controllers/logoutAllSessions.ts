import { Request, Response } from 'express';
import { logger } from '@packages/config/logger';
import redis from '@packages/redis';
import type { AuthenticatedRequest } from '@packages/types/express';
import { getRequestContext } from '@packages/utils';

export const logoutAllSessions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { requestId, clientIp, userAgent } = getRequestContext(
    req as unknown as Request
  );

  try {
    const userId = req.user.id;
    const { excludeCurrent } = req.query;

    const { logoutAllUserSessions, getUserCurrentLogin } = await import(
      '../repository/login.repository.js'
    );

    let currentSessionId: number | undefined;

    if (excludeCurrent === 'true') {
      // Get current session ID from the request or find the most recent active session
      const currentSession = await getUserCurrentLogin(userId);
      if (currentSession.rows.length > 0) {
        currentSessionId = currentSession.rows[0].id;
      }
    }

    await logoutAllUserSessions(userId, currentSessionId);

    // Clear refresh tokens from Redis (except current if excluded)
    if (!currentSessionId) {
      await redis.del(`refresh:${userId}`);
    }

    logger.info('All sessions logged out', {
      requestId,
      clientIp,
      userAgent,
      userId,
      excludedCurrentSession: !!currentSessionId,
    });

    res.status(200).json({
      success: true,
      message: currentSessionId
        ? 'All other sessions logged out successfully'
        : 'All sessions logged out successfully',
    });
  } catch (error) {
    logger.error('Failed to logout all sessions', {
      requestId,
      clientIp,
      userAgent,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to logout all sessions',
    });
  }
};
