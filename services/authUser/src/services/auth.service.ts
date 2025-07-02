import redis from '@packages/redis/index';
import { sendOtp } from './sendOtp.service.js';
import { logger } from '@packages/config/logger';
import type { User } from '@packages/database';
import { findUserByPhone, createUser } from '../repository/user.repository.js';
import { normalizePhoneNumber, maskPhoneNumber } from '@packages/utils';

const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 3600; // seconds
const OTP_RETRY_LIMIT = 3;
const OTP_RETRY_WINDOW = 1800; // seconds

interface LoginResult {
  user: User;
  isNewUser: boolean;
  remainingAttempts?: number;
}

export const handleLogin = async (
  phoneNumber: string
): Promise<LoginResult> => {
  const phoneValidation = normalizePhoneNumber(phoneNumber);

  if (!phoneValidation.isValid || !phoneValidation.normalizedNumber) {
    logger.error('Invalid phone number format during login', {
      phoneNumber: maskPhoneNumber(phoneNumber),
      error: phoneValidation.error,
    });
    throw new Error('Invalid phone number format');
  }

  const normalizedPhone = phoneValidation.normalizedNumber;

  // Check rate limits before proceeding
  await checkRateLimits(normalizedPhone);

  try {
    // Lookup user or create if not found
    const userResult = await findUserByPhone(normalizedPhone);
    let user: User;
    let isNewUser = false;

    if (userResult.rows.length === 0) {
      user = await createUser(normalizedPhone);
      isNewUser = true;
      logger.info('New user created', {
        phoneNumber: maskPhoneNumber(normalizedPhone),
      });
    } else {
      user = userResult.rows[0];
    }

    // Send OTP
    const otpSent = await sendOtp(normalizedPhone);

    if (!otpSent) {
      throw new Error('Failed to send OTP');
    }

    // Track OTP generation & login attempts for rate limiting
    await trackOtpGeneration(normalizedPhone);

    logger.info('Login initiated successfully', {
      userId: user.id,
      isNewUser,
      phoneNumber: maskPhoneNumber(normalizedPhone),
    });

    return { user, isNewUser };
  } catch (error) {
    logger.error('Login process failed', {
      phoneNumber: maskPhoneNumber(normalizedPhone),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

export const clearRateLimitCounters = async (
  phoneNumber: string
): Promise<void> => {
  const phoneValidation = normalizePhoneNumber(phoneNumber);
  if (!phoneValidation.isValid || !phoneValidation.normalizedNumber) {
    logger.error('Invalid phone number format when clearing rate limits', {
      phoneNumber: maskPhoneNumber(phoneNumber),
      error: phoneValidation.error,
    });
    return;
  }
  const normalizedPhone = phoneValidation.normalizedNumber;
  await redis.del(`login_attempts:${normalizedPhone}`);
  await redis.del(`otp_retry:${normalizedPhone}`);
};

async function checkRateLimits(phoneNumber: string): Promise<void> {
  const attemptKey = `login_attempts:${phoneNumber}`;
  const attempts = await redis.get(attemptKey);
  const currentAttempts = attempts ? parseInt(attempts, 10) : 0;

  if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
    const ttl = await redis.ttl(attemptKey);
    throw new Error(`RATE_LIMIT_EXCEEDED:${Math.max(ttl, 0)}`);
  }

  const otpRetryKey = `otp_retry:${phoneNumber}`;
  const otpRetries = await redis.get(otpRetryKey);
  const currentOtpRetries = otpRetries ? parseInt(otpRetries, 10) : 0;

  if (currentOtpRetries >= OTP_RETRY_LIMIT) {
    const ttl = await redis.ttl(otpRetryKey);
    throw new Error(`OTP_RATE_LIMIT_EXCEEDED:${Math.max(ttl, 0)}`);
  }
}

async function trackOtpGeneration(phoneNumber: string): Promise<void> {
  const attemptKey = `login_attempts:${phoneNumber}`;
  await redis.incr(attemptKey);
  await redis.expire(attemptKey, RATE_LIMIT_WINDOW);

  const otpRetryKey = `otp_retry:${phoneNumber}`;
  await redis.incr(otpRetryKey);
  await redis.expire(otpRetryKey, OTP_RETRY_WINDOW);
}
