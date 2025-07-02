import { Request, Response } from 'express';
import { sendOtp, verifyOtp } from '../services/twilio-otp.service.js';
import { logger } from '@packages/config/logger';
import { getRequestContext } from '@packages/utils';
import { maskPhoneNumber } from '@packages/utils';

export const sendOtpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { requestId } = getRequestContext(req);
  const { phoneNumber } = req.body;

  try {
    if (!phoneNumber) {
      res
        .status(400)
        .json({ success: false, message: 'Phone number required' });
      return;
    }

    const success = await sendOtp(phoneNumber);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: { phoneNumber: maskPhoneNumber(phoneNumber) },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
      });
    }
  } catch (error) {
    logger.error('Send OTP controller error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const verifyOtpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { requestId } = getRequestContext(req);
  const { phoneNumber, otp } = req.body;

  try {
    if (!phoneNumber || !otp) {
      res.status(400).json({
        success: false,
        message: 'Phone number and OTP required',
      });
      return;
    }

    const isValid = await verifyOtp(phoneNumber, otp);

    if (isValid) {
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }
  } catch (error) {
    logger.error('Verify OTP controller error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
