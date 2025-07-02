import { Request, Response } from 'express';
import { handleLogin } from '../services/auth.service.js';
import { logger } from '@packages/config/logger';
import { normalizePhoneNumber, maskPhoneNumber } from '@packages/utils';
import { getRequestContext } from '@packages/utils';

export const initiateLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { requestId, clientIp, userAgent } = getRequestContext(req);

  const { phoneNumber } = req.body;
  try {
    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
      return;
    }

    const result = await handleLogin(phoneNumber);

    logger.info('Login initiated', {
      requestId,
      clientIp,
      userAgent,
      userId: result.user.id,
      isNewUser: result.isNewUser,
      phoneNumber: maskPhoneNumber(phoneNumber),
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        userId: result.user.id,
        isNewUser: result.isNewUser,
        phoneNumber: (() => {
          const normalized = normalizePhoneNumber(phoneNumber);
          return normalized.isValid && normalized.normalizedNumber
            ? maskPhoneNumber(normalized.normalizedNumber)
            : maskPhoneNumber(phoneNumber);
        })(),
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.startsWith('RATE_LIMIT_EXCEEDED:')) {
      const ttl = parseInt(errorMessage.split(':')[1], 10);
      res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.',
        retryAfter: ttl,
      });
      return;
    }

    if (errorMessage.startsWith('OTP_RATE_LIMIT_EXCEEDED:')) {
      const ttl = parseInt(errorMessage.split(':')[1], 10);
      res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.',
        retryAfter: ttl,
      });
      return;
    }

    logger.error('Login initiation failed', {
      requestId,
      clientIp,
      userAgent,
      phoneNumber: phoneNumber ? maskPhoneNumber(phoneNumber) : 'unknown',
      error: errorMessage,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
    });
  }
};
