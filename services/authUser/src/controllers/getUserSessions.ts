import { Request, Response } from 'express';
import { logger } from '@packages/config/logger';

import type { AuthenticatedRequest } from '@packages/types/express';
import { getRequestContext } from '@packages/utils';

export const getUserSessions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { requestId, clientIp, userAgent } = getRequestContext(
    req as unknown as Request
  );

  try {
    const userId = req.user.id;
    const { getUserActiveSessions } = await import(
      '../repository/login.repository.js'
    );

    const result = await getUserActiveSessions(userId);

    res.status(200).json({
      success: true,
      data: {
        sessions: result.rows,
        count: result.rows.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get user sessions', {
      requestId,
      clientIp,
      userAgent,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions',
    });
  }
};
