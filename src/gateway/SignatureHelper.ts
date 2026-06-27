import { createHmac, timingSafeEqual } from 'node:crypto'

export const SignatureHelper = {
  forCreateRequest(apiKey: string, orderId: string, amount: string, notifyUrl: string): string {
    return createHmac('sha256', apiKey).update(`${orderId}|${amount}|${notifyUrl}`).digest('hex')
  },

  forWebhook(apiKey: string, paymentId: string, orderId: string, amount: string, status: string): string {
    return createHmac('sha256', apiKey).update(`${paymentId}|${orderId}|${amount}|${status}`).digest('hex')
  },

  verify(expected: string, received: string): boolean {
    try {
      return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'))
    } catch {
      return false
    }
  },
}
