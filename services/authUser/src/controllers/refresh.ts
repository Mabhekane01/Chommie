// src/controllers/refresh.ts - FIXED
import { Request, Response } from 'express';
import { z } from 'zod'; // Add this import
import { generateAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { logger } from '@packages/config/logger';
import redis from '@packages/redis'; // Add this import

interface ValidationError {
  field: string;
  message: string;
}

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const requestId = req.headers['x-request-id'] || 'unknown';

  try {
    // Validate input
    const validation = refreshSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: validation.error.errors.map(
          (err: z.ZodIssue): ValidationError => ({
            field: err.path.join('.'),
            message: err.message,
          })
        ),
      });
      return; // ✅ Just return, don't return res.json()
    }

    const { refreshToken } = validation.data;

    // Verify refresh token
    const { userId } = verifyRefreshToken(refreshToken);

    // Check if token exists in Redis
    const storedToken = await redis.get(`refresh:${userId}`);
    if (storedToken !== refreshToken) {
      logger.warn('Invalid refresh token attempted', {
        requestId,
        userId,
      });
      res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return; // ✅ Just return
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(userId);

    logger.info('Access token refreshed', {
      requestId,
      userId,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 900, // 15 minutes
      },
    });
    // ✅ Let function end naturally
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logger.warn('Token refresh failed', {
      requestId,
      error: errorMessage,
    });

    res.status(403).json({
      success: false,
      message: 'Token invalid or expired',
    });
    // ✅ Let function end naturally
  }
};
