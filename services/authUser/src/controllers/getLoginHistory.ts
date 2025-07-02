import { Request, Response } from 'express';
import { logger } from '@packages/config/logger';

import type { AuthenticatedRequest } from '@packages/types/express';
import { getRequestContext } from '@packages/utils';

export const getLoginHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { requestId, clientIp, userAgent } = getRequestContext(
    req as unknown as Request
  );

  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit < 1 || limit > 50) {
      res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 50',
      });
      return;
    }

    const { getUserLoginHistory } = await import(
      '../repository/login.repository.js'
    );
    const result = await getUserLoginHistory(userId, limit);

    res.status(200).json({
      success: true,
      data: {
        sessions: result.rows,
        count: result.rows.length,
        limit,
      },
    });
  } catch (error) {
    logger.error('Failed to get login history', {
      requestId,
      clientIp,
      userAgent,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve login history',
    });
  }
};
