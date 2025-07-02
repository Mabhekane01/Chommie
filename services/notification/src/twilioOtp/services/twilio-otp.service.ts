//notification/src/twilioOtp/services/twilio-otp.service.ts
import twilio from 'twilio';
import { logger } from '@packages/config/logger';
import { notificationConfig } from '../../config/config.js';
import { maskPhoneNumber } from '@packages/utils';

const twilioClient = twilio(
  notificationConfig.twilio.accountSid,
  notificationConfig.twilio.authToken
);
const TWILIO_VERIFY_SERVICE_SID = notificationConfig.twilio.verifyServiceSid;

export const sendOtp = async (phoneNumber: string): Promise<boolean> => {
  try {
    const verification = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });

    if (verification.status === 'pending') {
      logger.info('OTP sent successfully', {
        to: maskPhoneNumber(phoneNumber),
        channel: verification.channel,
      });
      return true;
    }

    logger.warn('OTP sending failed', {
      to: maskPhoneNumber(phoneNumber),
      status: verification.status,
    });
    return false;
  } catch (error) {
    logger.error('OTP sending error', {
      to: maskPhoneNumber(phoneNumber),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};

export const verifyOtp = async (
  phoneNumber: string,
  otpCode: string
): Promise<boolean> => {
  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: phoneNumber,
        code: otpCode,
      });

    if (verificationCheck.status === 'approved') {
      logger.info('OTP verified successfully', {
        to: maskPhoneNumber(phoneNumber),
      });
      return true;
    }

    logger.warn('OTP verification failed', {
      to: maskPhoneNumber(phoneNumber),
      status: verificationCheck.status,
    });
    return false;
  } catch (error) {
    logger.error('OTP verification error', {
      to: maskPhoneNumber(phoneNumber),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};
