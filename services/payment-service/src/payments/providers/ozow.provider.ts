import * as crypto from 'crypto';
import {
  PaymentInitiation,
  PaymentInitiationResult,
  PaymentProvider,
  WebhookResult,
  returnUrls,
} from './provider.interface';

/**
 * Ozow — instant bank-to-bank EFT. Hosted payment: we POST a signed field set to
 * Ozow and the customer completes payment in their bank. The request and the
 * notification are both authenticated with a SHA512 hash over the ordered field
 * values + the site's private key.
 *
 * NOTE: the exact hash field order must match Ozow's current "Post a payment
 * request" spec — confirm against live docs/credentials before going live.
 */
const OZOW_POST_URL = process.env.OZOW_POST_URL || 'https://pay.ozow.com';

function sha512(input: string): string {
  return crypto.createHash('sha512').update(input.toLowerCase()).digest('hex');
}

export class OzowProvider implements PaymentProvider {
  readonly method = 'OZOW';

  async initiate(init: PaymentInitiation): Promise<PaymentInitiationResult> {
    const siteCode = process.env.OZOW_SITE_CODE || '';
    const privateKey = process.env.OZOW_PRIVATE_KEY || '';
    if (!siteCode || !privateKey) {
      return { method: this.method, reference: init.reference, status: 'ERROR', error: 'Ozow not configured' };
    }

    const isTest = process.env.OZOW_IS_TEST === 'false' ? 'false' : 'true';
    const amount = init.amount.toFixed(2);
    const cancelUrl = returnUrls.cancel();
    const errorUrl = returnUrls.error();
    const successUrl = returnUrls.success();
    const notifyUrl = returnUrls.notify('ozow');

    const fields: Record<string, string> = {
      SiteCode: siteCode,
      CountryCode: 'ZA',
      CurrencyCode: 'ZAR',
      Amount: amount,
      TransactionReference: init.orderId,
      BankReference: init.orderId.slice(0, 20),
      CancelUrl: cancelUrl,
      ErrorUrl: errorUrl,
      SuccessUrl: successUrl,
      NotifyUrl: notifyUrl,
      IsTest: isTest,
    };

    // Hash: ordered values concatenated + private key, lowercased, SHA512.
    const hashInput =
      [
        fields.SiteCode,
        fields.CountryCode,
        fields.CurrencyCode,
        fields.Amount,
        fields.TransactionReference,
        fields.BankReference,
        fields.CancelUrl,
        fields.ErrorUrl,
        fields.SuccessUrl,
        fields.NotifyUrl,
        fields.IsTest,
      ].join('') + privateKey;

    return {
      method: this.method,
      reference: init.reference,
      status: 'INITIATED',
      postUrl: OZOW_POST_URL,
      form: { ...fields, HashCheck: sha512(hashInput) },
    };
  }

  async verifyWebhook(payload: Record<string, any>): Promise<WebhookResult> {
    const privateKey = process.env.OZOW_PRIVATE_KEY || '';
    // Ozow notification hash covers the response fields (excluding Hash) + key.
    const ordered = [
      payload.SiteCode,
      payload.TransactionId,
      payload.TransactionReference,
      payload.Amount,
      payload.Status,
      payload.Optional1,
      payload.CurrencyCode,
      payload.IsTest,
      payload.StatusMessage,
    ]
      .filter((v) => v !== undefined && v !== null)
      .join('');
    const expected = sha512(ordered + privateKey);
    const verified = !!payload.Hash && String(payload.Hash).toLowerCase() === expected;

    const status =
      String(payload.Status).toLowerCase() === 'complete'
        ? 'COMPLETED'
        : String(payload.Status).toLowerCase() === 'cancelled'
          ? 'FAILED'
          : 'PENDING';

    return {
      verified,
      orderId: payload.TransactionReference,
      externalReference: payload.TransactionId,
      status,
    };
  }
}
