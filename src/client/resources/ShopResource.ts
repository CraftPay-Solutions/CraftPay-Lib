import type { CraftPayClient } from '../CraftPayClient.js'
import type { Announcement, Gateway, RecentPurchase, Shop, ShopMe, TopPlayer } from '../types.js'

export class ShopResource {
  constructor(private client: CraftPayClient) {}

  async get(): Promise<Shop> {
    return (await this.client.get(`shops/${this.client.shopUuid}`)).data
  }

  async gateways(): Promise<Gateway[]> {
    return (await this.client.get(`shops/${this.client.shopUuid}/gateways`)).data
  }

  async topPlayers(): Promise<TopPlayer[]> {
    return (await this.client.get(`shops/${this.client.shopUuid}/top-players`)).data
  }

  async recentPurchases(): Promise<RecentPurchase[]> {
    return (await this.client.get(`shops/${this.client.shopUuid}/recent-purchases`)).data
  }

  async announcements(): Promise<Announcement[]> {
    return (await this.client.get(`shops/${this.client.shopUuid}/announcements`)).data
  }

  async me(): Promise<ShopMe> {
    return (await this.client.getAuthenticated(`shops/${this.client.shopUuid}/me`)).data
  }
}
