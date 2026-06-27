# @craftpay/sdk

Official CraftPay SDK for JavaScript / TypeScript.

Works in **Node.js 18+**, **Bun**, **Deno**, and modern browsers (client module only).

Two modules in one package:

| Module | Use case |
|--------|----------|
| `@craftpay/sdk` | Connect your website/app to the CraftPay API |
| `@craftpay/sdk/gateway` | For hosting panels — become a CraftPay payment gateway |

---

## Install

```bash
npm install @craftpay/sdk
# or
pnpm add @craftpay/sdk
# or
bun add @craftpay/sdk
```

---

## Client — connect your website to CraftPay API

```ts
import { CraftPayClient } from '@craftpay/sdk'

const client = new CraftPayClient({
  shopUuid:  'your-shop-uuid',
  apiSecret: 'your-api-secret',  // optional — only for /me and /transactions
})

// Shop info
const shop        = await client.shop().get()
const gateways    = await client.shop().gateways()
const topPlayers  = await client.shop().topPlayers()
const recent      = await client.shop().recentPurchases()
const news        = await client.shop().announcements()

// Packages & categories
const categories  = await client.categories().all()
const withPkgs    = await client.categories().packages(3)   // id or slug
const packages    = await client.packages().all()

// Create an order → redirect buyer to order.payment_url
const order = await client.orders().create({
  package_id: 7,
  nickname:   'Steve',
  gateway:    'cashbill',
})
window.location.href = order.payment_url

// Poll order status
const status = await client.orders().status(order.order_token)

// Validate voucher
const voucher = await client.vouchers().validate({
  code:     'PROMO100',
  nickname: 'Steve',
})

// Authenticated (requires apiSecret)
const me           = await client.shop().me()
const transactions = await client.orders().transactions({ page: 1, status: 'success' })
```

### Error handling

```ts
import { CraftPayError, ShopNotFoundError } from '@craftpay/sdk'

try {
  const shop = await client.shop().get()
} catch (err) {
  if (err instanceof ShopNotFoundError) {
    // shop doesn't exist or is disabled
  } else if (err instanceof CraftPayError) {
    console.log(err.errorCode)  // e.g. 'gateway_unavailable'
    console.log(err.status)     // HTTP status code
  }
}
```

### Next.js / React example

```ts
// lib/craftpay.ts
import { CraftPayClient } from '@craftpay/sdk'

export const craftpay = new CraftPayClient({
  shopUuid: process.env.NEXT_PUBLIC_CRAFTPAY_SHOP_UUID!,
})

// pages/shop.tsx
const packages = await craftpay.packages().all()
```

---

## Gateway — for hosting panels (Node.js only)

Use this when you want your hosting to appear as an available payment gateway in CraftPay.

### How it works

```
CraftPay  ──POST /api/craftpay/payments/create──▶  Your panel
                                                        │
                                                   (process payment)
                                                        │
Your panel ──POST {notify_url}──────────────────▶  CraftPay
```

### Express.js

```ts
import express from 'express'
import { validateCraftPayRequest, dispatchWebhook } from '@craftpay/sdk/gateway'

const app = express()
app.use(express.json())

const GATEWAY_OPTIONS = { apiKey: process.env.CRAFTPAY_GATEWAY_API_KEY! }

app.post('/api/craftpay/payments/create', async (req, res) => {
  let craftpay
  try {
    craftpay = validateCraftPayRequest(
      req.body,
      req.headers.authorization?.replace('Bearer ', ''),
      GATEWAY_OPTIONS,
    )
  } catch (err: any) {
    return res.status(err.status ?? 400).json({ error: err.code, message: err.message })
  }

  // Create payment in your system
  const payment = await MyPaymentSystem.create({
    amount:   craftpay.amount,
    currency: craftpay.currency,
  })

  res.status(201).json({
    payment_id:  payment.id,
    payment_url: payment.checkoutUrl,
  })
})
```

### Notify CraftPay when payment completes

Call `dispatchWebhook` from your own payment webhook handler:

```ts
import { dispatchWebhook } from '@craftpay/sdk/gateway'

// e.g. your Przelewy24 / Stripe webhook handler
app.post('/webhook/my-provider', async (req, res) => {
  const payment = await MyPaymentSystem.getByRef(req.body.reference)

  await dispatchWebhook({
    notifyUrl: payment.craftpayNotifyUrl,
    apiKey:    process.env.CRAFTPAY_GATEWAY_API_KEY!,
    paymentId: payment.id,
    orderId:   payment.craftpayOrderId,
    amount:    payment.amount,
  })

  res.sendStatus(200)
})
```

### Signature helpers (advanced)

```ts
import { SignatureHelper } from '@craftpay/sdk/gateway'

// Verify incoming CraftPay request manually
const expected = SignatureHelper.forCreateRequest(apiKey, orderId, amount, notifyUrl)
const valid = SignatureHelper.verify(expected, req.body.signature)

// Build outgoing webhook signature
const sig = SignatureHelper.forWebhook(apiKey, paymentId, orderId, amount, 'paid')
```

---

## TypeScript

Full type definitions are included — no `@types/*` needed.

```ts
import type { Shop, Package, Order, Transaction } from '@craftpay/sdk'
import type { CraftPayRequest } from '@craftpay/sdk/gateway'
```
