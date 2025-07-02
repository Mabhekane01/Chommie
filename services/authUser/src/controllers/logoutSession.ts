import { Request, Response } from 'express';
import { logger } from '@packages/config/logger';

import type { AuthenticatedRequest } from '@packages/types/express';
import { getRequestContext } from '@packages/utils';
export const logoutSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { requestId, clientIp, userAgent } = getRequestContext(
    req as unknown as Request
  );

  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
      return;
    }

    const { markSpecificLoginLogout, getLoginById } = await import(
      '../repository/login.repository.js'
    );

    // Convert sessionId to appropriate type based on your database schema
    const sessionIdNum = parseInt(sessionId);
    if (isNaN(sessionIdNum)) {
      res.status(400).json({
        success: false,
        message: 'Invalid session ID format',
      });
      return;
    }

    // Verify the session belongs to the user
    const sessionResult = await getLoginById(sessionIdNum);
    if (
      sessionResult.rows.length === 0 ||
      sessionResult.rows[0].userId !== userId
    ) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
      });
      return;
    }

    await markSpecificLoginLogout(sessionIdNum);

    logger.info('Session logged out', {
      requestId,
      clientIp,
      userAgent,
      userId,
      sessionId: sessionIdNum,
    });

    res.status(200).json({
      success: true,
      message: 'Session logged out successfully',
    });
  } catch (error) {
    logger.error('Failed to logout session', {
      requestId,
      clientIp,
      userAgent,
      userId: req.user?.id,
      sessionId: req.params.sessionId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to logout session',
    });
  }
};
