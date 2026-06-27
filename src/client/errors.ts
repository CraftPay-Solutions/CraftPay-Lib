export class CraftPayError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string = 'unknown',
    public readonly status: number = 0,
  ) {
    super(message)
    this.name = 'CraftPayError'
  }
}

export class ShopNotFoundError extends CraftPayError {
  constructor(uuid: string) {
    super(`Sklep '${uuid}' nie istnieje lub jest wyłączony.`, 'shop_not_found', 404)
    this.name = 'ShopNotFoundError'
  }
}

export class GatewayUnavailableError extends CraftPayError {
  constructor(message = 'Wybrana bramka płatności jest niedostępna.') {
    super(message, 'gateway_unavailable', 422)
    this.name = 'GatewayUnavailableError'
  }
}
