import type { CraftPayClient } from '../CraftPayClient.js'
import type { Package } from '../types.js'

export class PackageResource {
  constructor(private client: CraftPayClient) {}

  async all(): Promise<Package[]> {
    return (await this.client.get(`shops/${this.client.shopUuid}/packages`)).data
  }
}
