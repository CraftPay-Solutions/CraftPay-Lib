import { CraftPayError, ShopNotFoundError } from './errors.js'
import { CategoryResource } from './resources/CategoryResource.js'
import { OrderResource } from './resources/OrderResource.js'
import { PackageResource } from './resources/PackageResource.js'
import { ShopResource } from './resources/ShopResource.js'
import { VoucherResource } from './resources/VoucherResource.js'
import type { CraftPayClientOptions } from './types.js'

export class CraftPayClient {
  readonly shopUuid: string
  private readonly baseUrl: string
  private readonly apiSecret: string
  private readonly timeout: number

  constructor(options: CraftPayClientOptions) {
    this.shopUuid  = options.shopUuid
    this.baseUrl   = (options.baseUrl ?? 'https://api.craftpay.pl').replace(/\/$/, '')
    this.apiSecret = options.apiSecret ?? ''
    this.timeout   = options.timeout ?? 15_000
  }

  shop(): ShopResource         { return new ShopResource(this) }
  categories(): CategoryResource { return new CategoryResource(this) }
  packages(): PackageResource  { return new PackageResource(this) }
  orders(): OrderResource      { return new OrderResource(this) }
  vouchers(): VoucherResource  { return new VoucherResource(this) }

  async get(path: string, query: Record<string, unknown> = {}): Promise<any> {
    const url = this.buildUrl(path, query)
    return this.request(url, { method: 'GET' })
  }

  async post(path: string, body: unknown = {}): Promise<any> {
    const url = this.buildUrl(path)
    return this.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async getAuthenticated(path: string, query: Record<string, unknown> = {}): Promise<any> {
    const url = this.buildUrl(path, query)
    return this.request(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiSecret}` },
    })
  }

  private buildUrl(path: string, query: Record<string, unknown> = {}): string {
    const url = new URL(`${this.baseUrl}/v1/${path}`)
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
    return url.toString()
  }

  private async request(url: string, init: RequestInit): Promise<any> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    let response: Response
    try {
      response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'User-Agent': 'CraftPay-SDK/1.0',
          Accept: 'application/json',
          ...init.headers,
        },
      })
    } catch (err: any) {
      throw new CraftPayError(`Błąd połączenia z CraftPay API: ${err.message}`, 'connection_error')
    } finally {
      clearTimeout(timer)
    }

    const body = await response.json().catch(() => ({}))

    if (response.status === 404) throw new ShopNotFoundError(this.shopUuid)

    if (!response.ok) {
      const code = (body as any)?.error ?? 'api_error'
      const msg  = (body as any)?.message ?? `CraftPay API error ${response.status}`
      throw new CraftPayError(msg, code, response.status)
    }

    return body
  }
}
