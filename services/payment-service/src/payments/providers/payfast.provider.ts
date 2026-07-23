import * as crypto from 'crypto';
import {
  PaymentInitiation,
  PaymentInitiationResult,
  PaymentProvider,
  WebhookResult,
  returnUrls,
} from './provider.interface';

/** PayFast — all-in-one gateway (cards, EFT, SnapScan, Mobicred). MD5-signed form post. */
function payfastSignature(data: Record<string, string>): string {
  const usePassphrase = !!process.env.PAYFAST_PASSPHRASE;
  let out = '';
  for (const key of Object.keys(data).sort()) {
    if (key !== 'signature' && data[key] !== undefined && data[key] !== '') {
      out += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }
  out = out.slice(0, -1);
  if (usePassphrase) {
    out += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE!.trim()).replace(/%20/g, '+')}`;
  }
  return crypto.createHash('md5').update(out).digest('hex');
}

export class PayFastProvider implements PaymentProvider {
  readonly method = 'PAYFAST';

  async initiate(init: PaymentInitiation): Promise<PaymentInitiationResult> {
    const merchantId = process.env.PAYFAST_MERCHANT_ID || '';
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '';
    if (!merchantId || !merchantKey) {
      return { method: this.method, reference: init.reference, status: 'ERROR', error: 'PayFast not configured' };
    }
    const form: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrls.success(),
      cancel_url: returnUrls.cancel(),
      notify_url: returnUrls.notify('payfast'),
      email_address: init.email ?? '',
      m_payment_id: init.orderId,
      amount: init.amount.toFixed(2),
      item_name: init.items ?? `Chommie order ${init.orderId}`,
    };
    form.signature = payfastSignature(form);
    const postUrl =
      process.env.PAYFAST_SANDBOX === 'true'
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';
    return { method: this.method, reference: init.reference, status: 'INITIATED', postUrl, form };
  }

  async verifyWebhook(payload: Record<string, any>): Promise<WebhookResult> {
    const expected = payfastSignature(payload as Record<string, string>);
    const verified = expected === payload.signature;
    const status = payload.payment_status === 'COMPLETE' ? 'COMPLETED' : 'PENDING';
    return {
      verified,
      orderId: payload.m_payment_id,
      externalReference: payload.pf_payment_id,
      status,
    };
  }
}
