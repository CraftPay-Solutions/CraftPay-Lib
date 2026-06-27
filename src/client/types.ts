export interface CraftPayClientOptions {
  shopUuid: string
  apiSecret?: string
  baseUrl?: string
  timeout?: number
}

export interface Shop {
  uuid: string
  name: string
  logo_url: string | null
  server_ip: string | null
  accent_color: string
  button_text_color: string
  discord_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  terms_url: string | null
  gateways: Gateway[]
}

export interface Gateway {
  type: string
  label: string
  enabled: boolean
  custom: boolean
}

export interface Category {
  id: number
  name: string
  description: string | null
  icon: string | null
  slug: string
}

export interface Package {
  id: number
  category_id: number
  name: string
  description: string | null
  price: number
  icon: string | null
}

export interface CategoryWithPackages {
  category: Pick<Category, 'id' | 'name' | 'slug'>
  packages: Package[]
}

export interface Announcement {
  id: number
  title: string
  content: string
  type: string
}

export interface TopPlayer {
  nickname: string
  total_spent: number
  purchases_count: number
}

export interface RecentPurchase {
  package_name: string
  player_nickname: string
  quantity: number
  price: number
  purchased_at: string
}

export interface CreateOrderInput {
  package_id: number
  nickname: string
  gateway: string
}

export interface Order {
  order_token: string
  status: 'pending' | 'success' | 'failed' | 'expired'
  package_name: string
  player_nickname: string
  price: number
  payment_url: string
}

export interface OrderStatus extends Order {
  quantity: number
  created_at: string
  completed_at: string | null
}

export interface VoucherValidateInput {
  code: string
  nickname: string
  package_id?: number
}

export interface VoucherResult {
  valid: boolean
  message: string
  data?: { voucher_id: number; code: string }
}

export interface ShopStats {
  transactions_count: number
  total_earned: number
  categories_count: number
  packages_count: number
}

export interface ShopMe extends Shop {
  stats: ShopStats
}

export interface Transaction {
  token: string
  status: string
  package_name: string
  player_nickname: string
  price: number
  quantity: number
  payment_method: string
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    per_page: number
    last_page: number
  }
}

export interface TransactionFilters {
  page?: number
  per_page?: number
  status?: 'pending' | 'success' | 'failed' | 'expired'
}
