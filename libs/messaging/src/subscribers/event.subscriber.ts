import { Event } from '../events/base.event';

/**
 * Event handler interface
 */
export interface IEventHandler<T extends Event = Event> {
  handle(event: T): Promise<void>;
}

/**
 * Event subscriber interface
 */
export interface IEventSubscriber {
  subscribe(eventType: string, handler: IEventHandler): Promise<void>;
  unsubscribe(eventType: string): Promise<void>;
}

/**
 * NATS event subscriber implementation
 */
export class EventSubscriber implements IEventSubscriber {
  private handlers = new Map<string, IEventHandler[]>();

  constructor(private readonly natsConnection?: any) {}

  async subscribe(eventType: string, handler: IEventHandler): Promise<void> {
    try {
      // Add handler to local registry
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, []);
      }
      this.handlers.get(eventType)?.push(handler);

      console.log(`Subscribed to event: ${eventType}`);

      if (this.natsConnection) {
        // Implementation will be added when NATS client is available
        // const subscription = await this.natsConnection.subscribe(eventType);
        // for await (const message of subscription) {
        //   const event = JSON.parse(message.data);
        //   await this.handleEvent(eventType, event);
        // }
      }
    } catch (error) {
      console.error(`Failed to subscribe to event ${eventType}:`, error);
      throw error;
    }
  }

  async unsubscribe(eventType: string): Promise<void> {
    try {
      this.handlers.delete(eventType);
      console.log(`Unsubscribed from event: ${eventType}`);

      if (this.natsConnection) {
        // Implementation will be added when NATS client is available
      }
    } catch (error) {
      console.error(`Failed to unsubscribe from event ${eventType}:`, error);
      throw error;
    }
  }

  private async handleEvent(eventType: string, event: Event): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    
    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
        // Implement retry logic or dead letter queue here
      }
    }
  }
}

/**
 * Base event handler class
 */
export abstract class BaseEventHandler<T extends Event = Event> implements IEventHandler<T> {
  abstract handle(event: T): Promise<void>;
  
  protected log(message: string, event: T): void {
    console.log(`[${this.constructor.name}] ${message}`, {
      eventId: event.id,
      eventType: event.type,
      timestamp: event.timestamp,
    });
  }
}

/**
 * Event subscriber factory
 */
export class EventSubscriberFactory {
  static create(config?: any): IEventSubscriber {
    // Will be enhanced when proper NATS configuration is available
    return new EventSubscriber(config?.natsConnection);
  }
}