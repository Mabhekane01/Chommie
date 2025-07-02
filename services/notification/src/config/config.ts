//notificatio/src/config/config
import { z } from 'zod';
import { baseEnvSchema, baseConfig } from '@packages/config/env';

// Extend base env schema with Notification + Twilio specifics
const notificationEnvSchema = baseEnvSchema.extend({
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
  TWILIO_DEFAULT_LOCALE: z.string().default('en').optional(),
  TWILIO_FRIENDLY_NAME: z.string().default('API Gateway').optional(),
  TWILIO_VALID_UNTIL: z.string().optional(),
  NOTIFICATION_API_KEY: z.string().optional(),
});

export const notificationEnv = notificationEnvSchema.parse(process.env);

// Validate Twilio specifics (optional, copied from your custom validation)
if (
  !notificationEnv.TWILIO_ACCOUNT_SID.startsWith('AC') ||
  !notificationEnv.TWILIO_PHONE_NUMBER.match(/^\+\d{1,15}$/)
) {
  console.warn('⚠️ Invalid Twilio configuration or phone number format.');
}

// Export notification config that extends baseConfig
export const notificationConfig = {
  ...baseConfig,
  services: {
    ...baseConfig.services,
    notification: baseConfig.services.notification, // keep notification url from baseConfig
  },
  twilio: {
    accountSid: notificationEnv.TWILIO_ACCOUNT_SID,
    authToken: notificationEnv.TWILIO_AUTH_TOKEN,
    phoneNumber: notificationEnv.TWILIO_PHONE_NUMBER,
    verifyServiceSid: notificationEnv.TWILIO_VERIFY_SERVICE_SID,
    defaultLocale: notificationEnv.TWILIO_DEFAULT_LOCALE,
    friendlyName: notificationEnv.TWILIO_FRIENDLY_NAME,
    validUntil: notificationEnv.TWILIO_VALID_UNTIL
      ? new Date(notificationEnv.TWILIO_VALID_UNTIL)
      : undefined,
  },
  externalApis: {
    ...baseConfig.externalApis,
    notification: notificationEnv.NOTIFICATION_API_KEY,
  },
};

export type NotificationConfig = typeof notificationConfig;

if (notificationConfig.app.isDevelopment) {
  // Log config safely on dev start (exclude secrets)
  const safeNotificationConfig = {
    ...notificationConfig,
    twilio: {
      ...notificationConfig.twilio,
      authToken: '[REDACTED]',
    },
    externalApis: {
      notification: notificationConfig.externalApis.notification
        ? '[REDACTED]'
        : undefined,
    },
  };

  console.log(
    '📋 Notification Configuration loaded:',
    JSON.stringify(safeNotificationConfig, null, 2)
  );
}
