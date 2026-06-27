export interface GatewayOptions {
  apiKey: string
  webhookHeader?: string
}

export interface CreatePaymentPayload {
  order_id: string
  amount: string
  currency: string
  description: string
  return_url: string
  notify_url: string
  signature: string
}

export interface PaymentResult {
  paymentId: string
  paymentUrl: string
}

export interface NotifyPaidOptions {
  notifyUrl: string
  apiKey: string
  paymentId: string
  orderId: string
  amount: string
  currency?: string
  status?: 'paid' | 'failed'
}
