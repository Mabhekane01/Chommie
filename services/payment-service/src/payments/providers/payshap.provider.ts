import {
  PaymentInitiation,
  PaymentInitiationResult,
  PaymentProvider,
  WebhookResult,
} from './provider.interface';

/**
 * PayShap — the SARB Rapid Payments rail: instant, low-value, phone-native
 * "proxy pay" to a ShapID. There is no direct merchant API; PayShap is
 * originated through a PSP (Ozow RPP / Peach / Stitch). This adapter models the
 * request-to-pay flow: we hand the member instructions to pay our merchant proxy
 * with the order reference, and reconcile on the PSP's callback.
 *
 * Wire a PSP's RPP "request to pay" here to make it a push flow instead of pull.
 */
export class PayShapProvider implements PaymentProvider {
  readonly method = 'PAYSHAP';

  async initiate(init: PaymentInitiation): Promise<PaymentInitiationResult> {
    const proxy = process.env.PAYSHAP_PROXY || '';
    if (!proxy) {
      return {
        method: this.method,
        reference: init.reference,
        status: 'ERROR',
        error: 'PayShap proxy (ShapID) not configured',
      };
    }
    return {
      method: this.method,
      reference: init.reference,
      status: 'PENDING',
      instructions:
        `Open your banking app and pay R${init.amount.toFixed(2)} via PayShap to ` +
        `${proxy} using reference ${init.orderId}. Your order confirms automatically once received.`,
    };
  }

  async verifyWebhook(payload: Record<string, any>): Promise<WebhookResult> {
    // PSP reconciliation callback keyed by our reference. Verification of the
    // PSP signature belongs here once a PSP is wired.
    const status =
      String(payload.status ?? payload.Status).toUpperCase() === 'COMPLETE' ||
      String(payload.status ?? payload.Status).toUpperCase() === 'COMPLETED'
        ? 'COMPLETED'
        : 'PENDING';
    return {
      verified: true,
      orderId: payload.reference ?? payload.Reference ?? payload.orderId,
      externalReference: payload.transactionId ?? payload.TransactionId,
      status,
    };
  }
}
