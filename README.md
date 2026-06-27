# @craftpay/sdk

Oficjalne SDK platformy [CraftPay](https://craftpay.pl) dla JavaScript / TypeScript.

Działa w **Node.js 18+**, **Bun**, **Deno** oraz nowoczesnych przeglądarkach (tylko moduł client).

Dwa moduły w jednym pakiecie:

| Moduł | Do czego |
|-------|----------|
| `@craftpay/sdk` | Podłączenie własnej strony/aplikacji pod API CraftPay |
| `@craftpay/sdk/gateway` | Dla paneli hostingowych — stanie się bramką płatności w CraftPay |

---

## Instalacja

```bash
npm install @craftpay/sdk
# lub
pnpm add @craftpay/sdk
# lub
bun add @craftpay/sdk
```

---

## Moduł Client — własna strona pod API CraftPay

```ts
import { CraftPayClient } from '@craftpay/sdk'

const client = new CraftPayClient({
  shopUuid:  'uuid-twojego-sklepu',
  apiSecret: 'twoj-api-secret',  // opcjonalne — tylko dla /me i /transactions
})

// Informacje o sklepie
const sklep      = await client.shop().get()
const bramki     = await client.shop().gateways()
const topGracze  = await client.shop().topPlayers()
const ostatnie   = await client.shop().recentPurchases()
const ogloszenia = await client.shop().announcements()

// Pakiety i kategorie
const kategorie  = await client.categories().all()
const zpakietami = await client.categories().packages(3)  // id lub slug
const pakiety    = await client.packages().all()

// Złożenie zamówienia → przekieruj kupującego na order.payment_url
const zamowienie = await client.orders().create({
  package_id: 7,
  nickname:   'Steve',
  gateway:    'cashbill',
})
window.location.href = zamowienie.payment_url

// Status zamówienia
const status = await client.orders().status(zamowienie.order_token)

// Walidacja vouchera
const voucher = await client.vouchers().validate({
  code:     'PROMO100',
  nickname: 'Steve',
})

// Wymagają apiSecret
const ja           = await client.shop().me()
const transakcje   = await client.orders().transactions({ page: 1, status: 'success' })
```

### Obsługa błędów

```ts
import { CraftPayError, ShopNotFoundError } from '@craftpay/sdk'

try {
  const sklep = await client.shop().get()
} catch (err) {
  if (err instanceof ShopNotFoundError) {
    // sklep nie istnieje lub jest wyłączony
  } else if (err instanceof CraftPayError) {
    console.log(err.errorCode)  // np. 'gateway_unavailable'
    console.log(err.status)     // HTTP status
  }
}
```

### Next.js / React

```ts
// lib/craftpay.ts
import { CraftPayClient } from '@craftpay/sdk'

export const craftpay = new CraftPayClient({
  shopUuid: process.env.NEXT_PUBLIC_CRAFTPAY_SHOP_UUID!,
})

// app/shop/page.tsx
const pakiety = await craftpay.packages().all()
```

---

## Moduł Gateway — dla hostingów (tylko Node.js)

Użyj gdy chcesz żeby Twój hosting pojawił się jako dostępna bramka płatności w CraftPay.

### Jak to działa

```
CraftPay  ──POST /api/craftpay/payments/create──▶  Twój panel
                                                        │
                                                   (przetwarzasz płatność)
                                                        │
Twój panel ──POST {notify_url}──────────────────▶  CraftPay
```

### Express.js

```ts
import express from 'express'
import { validateCraftPayRequest, dispatchWebhook } from '@craftpay/sdk/gateway'

const app = express()
app.use(express.json())

const OPCJE = { apiKey: process.env.CRAFTPAY_GATEWAY_API_KEY! }

app.post('/api/craftpay/payments/create', async (req, res) => {
  let craftpay
  try {
    craftpay = validateCraftPayRequest(
      req.body,
      req.headers.authorization?.replace('Bearer ', ''),
      OPCJE,
    )
  } catch (err: any) {
    return res.status(err.status ?? 400).json({ error: err.code, message: err.message })
  }

  // Stwórz płatność w swoim systemie
  const platnosc = await MojSystemPlatnosci.create({
    amount:   craftpay.amount,
    currency: craftpay.currency,
  })

  res.status(201).json({
    payment_id:  platnosc.id,
    payment_url: platnosc.checkoutUrl,
  })
})
```

### Powiadamianie CraftPay o płatności

Wywołaj `dispatchWebhook` z handlera swojego dostawcy płatności (np. Przelewy24, Stripe):

```ts
import { dispatchWebhook } from '@craftpay/sdk/gateway'

app.post('/webhook/moj-dostawca', async (req, res) => {
  const platnosc = await MojSystemPlatnosci.getByRef(req.body.reference)

  await dispatchWebhook({
    notifyUrl: platnosc.craftpayNotifyUrl,
    apiKey:    process.env.CRAFTPAY_GATEWAY_API_KEY!,
    paymentId: platnosc.id,
    orderId:   platnosc.craftpayOrderId,
    amount:    platnosc.amount,
  })

  res.sendStatus(200)
})
```

### Podpisy HMAC (zaawansowane)

```ts
import { SignatureHelper } from '@craftpay/sdk/gateway'

// Weryfikacja przychodzącego requestu od CraftPay
const expected = SignatureHelper.forCreateRequest(apiKey, orderId, amount, notifyUrl)
const valid = SignatureHelper.verify(expected, req.body.signature)

// Budowanie podpisu webhooka wychodzącego do CraftPay
const sig = SignatureHelper.forWebhook(apiKey, paymentId, orderId, amount, 'paid')
```

---

## TypeScript

Pełne definicje typów w środku — bez potrzeby instalowania `@types/*`.

```ts
import type { Shop, Package, Order, Transaction } from '@craftpay/sdk'
import type { CraftPayRequest } from '@craftpay/sdk/gateway'
```
