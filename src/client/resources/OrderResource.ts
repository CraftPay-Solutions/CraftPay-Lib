import type { CraftPayClient } from '../CraftPayClient.js'
import type { CreateOrderInput, Order, OrderStatus, PaginatedResponse, Transaction, TransactionFilters } from '../types.js'

export class OrderResource {
  constructor(private client: CraftPayClient) {}

  async create(data: CreateOrderInput): Promise<Order> {
    return (await this.client.post(`shops/${this.client.shopUuid}/orders`, data)).data
  }

  async status(token: string): Promise<OrderStatus> {
    return (await this.client.get(`shops/${this.client.shopUuid}/orders/${token}`)).data
  }

  async transactions(filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
    return this.client.getAuthenticated(`shops/${this.client.shopUuid}/transactions`, filters)
  }
}
