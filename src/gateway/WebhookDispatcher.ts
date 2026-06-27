import { SignatureHelper } from './SignatureHelper.js'
import type { NotifyPaidOptions } from './types.js'

export async function dispatchWebhook(options: NotifyPaidOptions): Promise<void> {
  const {
    notifyUrl,
    apiKey,
    paymentId,
    orderId,
    amount,
    currency = 'PLN',
    status = 'paid',
  } = options

  const signature = SignatureHelper.forWebhook(apiKey, paymentId, orderId, amount, status)

  const webhookHeader = 'X-CraftPay-Signature'

  const response = await fetch(notifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [webhookHeader]: signature,
    },
    body: JSON.stringify({
      payment_id: paymentId,
      order_id:   orderId,
      amount,
      currency,
      status,
      paid_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`CraftPay webhook zwrócił HTTP ${response.status}`)
  }
}
