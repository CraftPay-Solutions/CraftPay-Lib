import type { CraftPayClient } from '../CraftPayClient.js'
import type { Category, CategoryWithPackages } from '../types.js'

export class CategoryResource {
  constructor(private client: CraftPayClient) {}

  async all(): Promise<Category[]> {
    return (await this.client.get(`shops/${this.client.shopUuid}/categories`)).data
  }

  async packages(categoryId: number | string): Promise<CategoryWithPackages> {
    return (await this.client.get(`shops/${this.client.shopUuid}/categories/${categoryId}/packages`)).data
  }
}
