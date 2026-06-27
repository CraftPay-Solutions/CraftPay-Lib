import { timingSafeEqual } from 'node:crypto'
import { SignatureHelper } from './SignatureHelper.js'
import type { CreatePaymentPayload, GatewayOptions } from './types.js'

export interface CraftPayRequest {
  orderId: string
  amount: string
  currency: string
  description: string
  returnUrl: string
  notifyUrl: string
  apiKey: string
}

export function validateCraftPayRequest(
  body: Record<string, unknown>,
  bearerToken: string | undefined,
  options: GatewayOptions,
): CraftPayRequest {
  if (!bearerToken || !safeCompare(options.apiKey, bearerToken)) {
    throw Object.assign(new Error('Nieprawidłowy klucz API.'), { status: 401, code: 'unauthorized' })
  }

  const { order_id, amount, currency, description, return_url, notify_url, signature } = body as Partial<CreatePaymentPayload>

  if (!order_id || !amount || !notify_url || !signature) {
    throw Object.assign(new Error('Brakuje wymaganych pól.'), { status: 400, code: 'bad_request' })
  }

  const expected = SignatureHelper.forCreateRequest(options.apiKey, order_id, amount, notify_url)

  if (!SignatureHelper.verify(expected, signature)) {
    throw Object.assign(new Error('Nieprawidłowy podpis żądania.'), { status: 403, code: 'invalid_signature' })
  }

  return {
    orderId:     order_id,
    amount,
    currency:    (currency as string) ?? 'PLN',
    description: (description as string) ?? '',
    returnUrl:   (return_url as string) ?? '',
    notifyUrl:   notify_url,
    apiKey:      bearerToken,
  }
}

function safeCompare(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a)
    const bb = Buffer.from(b)
    if (ba.length !== bb.length) return false
    return timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}
