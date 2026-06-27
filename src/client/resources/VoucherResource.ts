import type { CraftPayClient } from '../CraftPayClient.js'
import type { VoucherResult, VoucherValidateInput } from '../types.js'

export class VoucherResource {
  constructor(private client: CraftPayClient) {}

  async validate(data: VoucherValidateInput): Promise<VoucherResult> {
    return this.client.post(`shops/${this.client.shopUuid}/vouchers/validate`, data)
  }
}
