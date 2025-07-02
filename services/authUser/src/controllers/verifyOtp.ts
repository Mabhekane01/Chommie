import type { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@packages/config/logger';
import { verifyOtpAndAuthenticate } from '../services/verifyOtp.service.js';

const verifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const verifyOtpController = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  const validation = verifyOtpSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      errors: validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  const { phoneNumber, otp } = validation.data;

  try {
    const authResult = await verifyOtpAndAuthenticate(
      phoneNumber,
      otp,
      req,
      requestId as string
    );

    logger.info('User authenticated after OTP verification', {
      requestId,
      userId: authResult.user.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: authResult.user.id,
          name: authResult.user.name,
        },
        tokens: authResult.tokens,
        loginSessionId: authResult.loginSession.id,
      },
    });
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logger.error('OTP verification and authentication failed', {
      requestId,
      error: errorMessage,
    });

    return res
      .status(
        errorMessage === 'Invalid or expired OTP'
          ? 401
          : errorMessage === 'User not found'
            ? 404
            : errorMessage === 'Invalid phone number format'
              ? 400
              : 500
      )
      .json({
        success: false,
        message:
          process.env.NODE_ENV === 'production'
            ? 'Authentication failed. Please try again.'
            : errorMessage,
      });
  }
};
