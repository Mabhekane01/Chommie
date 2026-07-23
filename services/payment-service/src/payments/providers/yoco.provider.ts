import * as crypto from 'crypto';
import {
  PaymentInitiation,
  PaymentInitiationResult,
  PaymentProvider,
  WebhookResult,
  returnUrls,
} from './provider.interface';

/**
 * Yoco — cards + QR (strong reseller/spaza reach). Uses the Yoco Online Checkout
 * API: POST a checkout with the secret key, redirect the customer to the returned
 * URL, and confirm via a signed webhook (payment.succeeded).
 */
const YOCO_CHECKOUT_URL = process.env.YOCO_CHECKOUT_URL || 'https://payments.yoco.com/api/checkouts';

export class YocoProvider implements PaymentProvider {
  readonly method = 'YOCO';

  async initiate(init: PaymentInitiation): Promise<PaymentInitiationResult> {
    const secret = process.env.YOCO_SECRET_KEY || '';
    if (!secret) {
      return { method: this.method, reference: init.reference, status: 'ERROR', error: 'Yoco not configured' };
    }
    try {
      const res = await (globalThis as any).fetch(YOCO_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({
          amount: Math.round(init.amount * 100), // cents
          currency: 'ZAR',
          successUrl: returnUrls.success(),
          cancelUrl: returnUrls.cancel(),
          metadata: { orderId: init.orderId, reference: init.reference },
        }),
      });
      const json: any = await res.json();
      if (!res.ok || !json?.redirectUrl) {
        return {
          method: this.method,
          reference: init.reference,
          status: 'ERROR',
          error: json?.message || `Yoco checkout failed (${res.status})`,
        };
      }
      return {
        method: this.method,
        reference: init.reference,
        status: 'INITIATED',
        redirectUrl: json.redirectUrl,
      };
    } catch (e) {
      return {
        method: this.method,
        reference: init.reference,
        status: 'ERROR',
        error: e instanceof Error ? e.message : 'Yoco request failed',
      };
    }
  }

  async verifyWebhook(
    payload: Record<string, any>,
    headers?: Record<string, string>,
  ): Promise<WebhookResult> {
    const secret = process.env.YOCO_WEBHOOK_SECRET || '';
    let verified = !secret; // if no secret configured, don't hard-fail in dev
    if (secret && headers) {
      // Yoco signs `${id}.${timestamp}.${body}` with the webhook secret (HMAC-SHA256).
      const id = headers['webhook-id'];
      const ts = headers['webhook-timestamp'];
      const signed = `${id}.${ts}.${JSON.stringify(payload)}`;
      const key = Buffer.from(secret.split('_').pop() || secret, 'base64');
      const expected = crypto.createHmac('sha256', key).update(signed).digest('base64');
      const provided = (headers['webhook-signature'] || '').split(' ').map((s) => s.split(',').pop());
      verified = provided.includes(expected);
    }
    const type = payload.type ?? payload.event;
    const status = type === 'payment.succeeded' ? 'COMPLETED' : 'PENDING';
    const orderId = payload?.payload?.metadata?.orderId ?? payload?.metadata?.orderId;
    return { verified, orderId, externalReference: payload?.payload?.id ?? payload?.id, status };
  }
}
