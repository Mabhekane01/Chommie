/**
 * Payment-provider abstraction (docs/ARCHITECTURE.md §4). One interface, one
 * adapter per SA rail (Ozow · PayShap · PayFast · Yoco), selected by method, so
 * checkout stays provider-agnostic.
 */

export interface PaymentInitiation {
  /** Our transaction id. */
  reference: string;
  orderId: string;
  userId: string;
  /** Amount in ZAR major units (rands). */
  amount: number;
  email?: string;
  phone?: string;
  items?: string;
}

export interface PaymentInitiationResult {
  method: string;
  reference: string;
  status: 'INITIATED' | 'PENDING' | 'ERROR';
  /** Where to send the customer (redirect gateways: Yoco). */
  redirectUrl?: string;
  /** Form-post gateways (Ozow, PayFast) — POST `form` to `postUrl`. */
  postUrl?: string;
  form?: Record<string, string>;
  /** Human instructions (PayShap request-to-pay). */
  instructions?: string;
  error?: string;
}

export interface WebhookResult {
  verified: boolean;
  orderId?: string;
  externalReference?: string;
  status?: 'COMPLETED' | 'FAILED' | 'PENDING';
}

export interface PaymentProvider {
  readonly method: string;
  initiate(init: PaymentInitiation): Promise<PaymentInitiationResult>;
  verifyWebhook(
    payload: Record<string, any>,
    headers?: Record<string, string>,
  ): Promise<WebhookResult>;
}

const envUrl = (key: string, fallbackPath: string) =>
  process.env[key] || `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}${fallbackPath}`;

export const returnUrls = {
  success: () => envUrl('PAYMENT_SUCCESS_URL', '/checkout/success'),
  cancel: () => envUrl('PAYMENT_CANCEL_URL', '/checkout/cancel'),
  error: () => envUrl('PAYMENT_ERROR_URL', '/checkout/error'),
  notify: (provider: string) => envUrl('PAYMENT_NOTIFY_URL', `/payments/webhook/${provider}`),
};
