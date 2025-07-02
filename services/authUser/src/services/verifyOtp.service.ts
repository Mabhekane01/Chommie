import axios from 'axios';
import { logger } from '@packages/config/logger';
import { maskPhoneNumber, normalizePhoneNumber } from '@packages/utils';
import { findUserByPhone } from '../repository/user.repository.js';
import { createUserLogin } from '../repository/login.repository.js';
import { generateTokenPair as generateTokens } from '../utils/jwt.js';
import { clearRateLimitCounters } from './auth.service.js';
import type { Request } from 'express';
import type { User } from '@packages/database';
import type { UserLogin } from '../types/UserLogin.js';
import { UAParser } from 'ua-parser-js';
import { getGeoLocationFromIP } from '../utils/geolocation.js';

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002';

interface AuthResult {
  user: User;
  loginSession: UserLogin;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const verifyOtpAndAuthenticate = async (
  phoneNumber: string,
  otp: string,
  req: Request,
  requestId: string
): Promise<AuthResult> => {
  const phoneValidation = normalizePhoneNumber(phoneNumber);

  if (!phoneValidation.isValid || !phoneValidation.normalizedNumber) {
    logger.error('Invalid phone number format during OTP verification', {
      phoneNumber: maskPhoneNumber(phoneNumber),
      error: phoneValidation.error,
    });
    throw new Error('Invalid phone number format');
  }

  const normalizedPhone = phoneValidation.normalizedNumber;

  try {
    // Step 1: Verify OTP with notification service
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/verify-otp`,
      {
        phoneNumber: normalizedPhone,
        otp,
        requestId,
        userAgent: req.headers['user-agent'],
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-service': 'auth',
          'x-request-id': requestId,
        },
        timeout: 10000,
      }
    );

    if (!response.data.success) {
      logger.warn('OTP verification failed via notification service', {
        phoneNumber: maskPhoneNumber(normalizedPhone),
        message: response.data.message,
      });
      throw new Error('Invalid or expired OTP');
    }

    logger.info('OTP verified successfully via notification service', {
      phoneNumber: maskPhoneNumber(normalizedPhone),
    });

    // Step 2: Clear any rate limit counters
    await clearRateLimitCounters(normalizedPhone);

    // Step 3: Lookup user
    const userResult = await findUserByPhone(normalizedPhone);
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const user = userResult.rows[0];

    // Step 4: Create login session
    const userAgentRaw = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentRaw);
    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '';

    const device = parser.getDevice().model || 'Unknown Device';
    const browser = parser.getBrowser().name || 'Unknown Browser';
    const os = parser.getOS().name || 'Unknown OS';
    const { country, city } = await getGeoLocationFromIP(clientIp);

    const loginSession = await createUserLogin(
      user.id,
      clientIp,
      userAgentRaw,
      device,
      browser,
      os,
      country,
      city
    );

    // Step 5: Generate tokens
    const tokens = await generateTokens(user.id);

    logger.info('User authenticated successfully', {
      userId: user.id,
      phoneNumber: maskPhoneNumber(normalizedPhone),
      loginSessionId: loginSession.id,
    });

    return {
      user,
      loginSession,
      tokens,
    };
  } catch (error: any) {
    let errorMessage = 'Unknown error';

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        errorMessage =
          error.response.data?.message || 'Notification service error';

        logger.error('Notification service responded with error', {
          phoneNumber: maskPhoneNumber(normalizedPhone),
          status,
          message: errorMessage,
        });

        if (status === 400) {
          throw new Error('Invalid or expired OTP');
        } else {
          throw new Error('Authentication service error');
        }
      } else if (error.request) {
        errorMessage = 'Notification service unavailable';
        logger.error('Notification service not reachable', {
          phoneNumber: maskPhoneNumber(normalizedPhone),
          error: errorMessage,
        });
        throw new Error('Authentication service unavailable');
      } else {
        errorMessage = 'Service communication error';
        logger.error('Unexpected axios request error', {
          phoneNumber: maskPhoneNumber(normalizedPhone),
          error: error.message,
        });
        throw new Error('Authentication service error');
      }
    } else if (error instanceof Error) {
      if (
        [
          'Invalid or expired OTP',
          'User not found',
          'Invalid phone number format',
        ].includes(error.message)
      ) {
        throw error;
      }

      errorMessage = error.message;
      logger.error('OTP verification failed - unexpected error', {
        phoneNumber: maskPhoneNumber(normalizedPhone),
        error: errorMessage,
      });

      throw new Error('Authentication failed');
    }

    throw new Error('Authentication failed');
  }
};
