import { Event } from '../events/base.event';

/**
 * Event publisher interface
 */
export interface IEventPublisher {
  publish(event: Event): Promise<void>;
  publishBatch(events: Event[]): Promise<void>;
}

/**
 * NATS event publisher implementation
 */
export class EventPublisher implements IEventPublisher {
  constructor(private readonly natsConnection?: any) {}

  async publish(event: Event): Promise<void> {
    try {
      // Implementation will be added when NATS client is available
      console.log(`Publishing event: ${event.type}`, {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        tenantId: event.tenantId,
      });

      if (this.natsConnection) {
        // await this.natsConnection.publish(event.type, JSON.stringify(event));
      }
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  async publishBatch(events: Event[]): Promise<void> {
    try {
      // Implementation will be added when NATS client is available
      console.log(`Publishing ${events.length} events in batch`);

      for (const event of events) {
        await this.publish(event);
      }
    } catch (error) {
      console.error('Failed to publish event batch:', error);
      throw error;
    }
  }
}

/**
 * Event publisher factory
 */
export class EventPublisherFactory {
  static create(config?: any): IEventPublisher {
    // Will be enhanced when proper NATS configuration is available
    return new EventPublisher(config?.natsConnection);
  }
}