import axios from 'axios';
import { logger } from '@packages/config/logger';
import { maskPhoneNumber } from '@packages/utils';

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002';

export const sendOtp = async (phoneNumber: string): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/send-otp`,
      { phoneNumber },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-service': 'auth',
        },
        timeout: 10000,
      }
    );

    if (response.data.success) {
      logger.info('OTP sent successfully via notification service', {
        phoneNumber: maskPhoneNumber(phoneNumber),
      });
      return true;
    } else {
      logger.warn('OTP sending failed via notification service', {
        phoneNumber: maskPhoneNumber(phoneNumber),
        message: response.data.message,
      });
      return false;
    }
  } catch (error: any) {
    let errorMessage = 'Unknown error';

    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage =
          error.response.data?.message || 'Notification service error';
        logger.error('OTP sending failed - notification service error', {
          phoneNumber: maskPhoneNumber(phoneNumber),
          status: error.response.status,
          message: errorMessage,
        });
      } else if (error.request) {
        errorMessage = 'Notification service unavailable';
        logger.error('OTP sending failed - notification service unreachable', {
          phoneNumber: maskPhoneNumber(phoneNumber),
          error: errorMessage,
        });
      } else {
        errorMessage = 'Service communication error';
        logger.error('OTP sending failed - request configuration error', {
          phoneNumber: maskPhoneNumber(phoneNumber),
          error: error.message,
        });
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      logger.error('OTP sending failed - unexpected error', {
        phoneNumber: maskPhoneNumber(phoneNumber),
        error: errorMessage,
      });
    }

    return false;
  }
};
