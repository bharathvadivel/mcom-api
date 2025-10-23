import { Event } from './base.event';

/**
 * Product created event
 */
export class ProductCreatedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      name: string;
      slug: string;
      sku?: string;
      price?: number;
      status: string;
    },
    tenantId: string,
    userId?: string
  ) {
    super('product.created', 'catalog-service', tenantId, userId);
  }
}

/**
 * Product updated event
 */
export class ProductUpdatedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      name: string;
      slug: string;
      changes: string[];
    },
    tenantId: string,
    userId?: string
  ) {
    super('product.updated', 'catalog-service', tenantId, userId);
  }
}

/**
 * Product deleted event
 */
export class ProductDeletedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      name: string;
      slug: string;
    },
    tenantId: string,
    userId?: string
  ) {
    super('product.deleted', 'catalog-service', tenantId, userId);
  }
}

/**
 * Product inventory updated event
 */
export class ProductInventoryUpdatedEvent extends Event {
  constructor(
    public readonly data: {
      productId: string;
      variantId?: string;
      oldQuantity: number;
      newQuantity: number;
      reason: string;
    },
    tenantId: string,
    userId?: string
  ) {
    super('product.inventory.updated', 'catalog-service', tenantId, userId);
  }
}