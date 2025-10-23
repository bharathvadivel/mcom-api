import { Event } from './base.event';

/**
 * Order created event
 */
export class OrderCreatedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      customerId?: string;
      totalAmount: number;
      currency: string;
      items: Array<{
        productId: string;
        variantId?: string;
        quantity: number;
        price: number;
      }>;
    },
    tenantId: string,
    userId?: string
  ) {
    super('order.created', 'order-service', tenantId, userId);
  }
}

/**
 * Order updated event
 */
export class OrderUpdatedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      status: string;
      changes: string[];
    },
    tenantId: string,
    userId?: string
  ) {
    super('order.updated', 'order-service', tenantId, userId);
  }
}

/**
 * Order cancelled event
 */
export class OrderCancelledEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      reason?: string;
    },
    tenantId: string,
    userId?: string
  ) {
    super('order.cancelled', 'order-service', tenantId, userId);
  }
}

/**
 * Order shipped event
 */
export class OrderShippedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      orderNumber: string;
      trackingNumber?: string;
      carrier?: string;
    },
    tenantId: string,
    userId?: string
  ) {
    super('order.shipped', 'order-service', tenantId, userId);
  }
}