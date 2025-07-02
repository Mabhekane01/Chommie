import { Request, Response } from 'express';
import { logger } from '@packages/config/logger';
import type { AuthenticatedRequest } from '@packages/types/express';
import { getRequestContext } from '@packages/utils';

export const getCurrentSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { requestId, clientIp, userAgent } = getRequestContext(
    req as unknown as Request
  );

  try {
    const userId = req.user.id;
    const { getUserCurrentLogin } = await import(
      '../repository/login.repository.js'
    );

    const result = await getUserCurrentLogin(userId);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No active session found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        session: result.rows[0],
      },
    });
  } catch (error) {
    logger.error('Failed to get current session', {
      requestId,
      clientIp,
      userAgent,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current session',
    });
  }
};
