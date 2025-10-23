/**
 * Messaging configuration
 */
export interface MessagingConfig {
  provider: 'nats' | 'rabbitmq' | 'redis';
  url: string;
  options?: {
    maxReconnectAttempts?: number;
    reconnectTimeWait?: number;
    timeout?: number;
  };
  subjects?: {
    prefix?: string;
    separator?: string;
  };
}

/**
 * NATS configuration
 */
export interface NATSConfig extends MessagingConfig {
  provider: 'nats';
  cluster?: {
    name?: string;
    id?: string;
  };
  jetstream?: {
    enabled?: boolean;
    domain?: string;
  };
}

/**
 * RabbitMQ configuration
 */
export interface RabbitMQConfig extends MessagingConfig {
  provider: 'rabbitmq';
  exchange?: {
    name?: string;
    type?: 'direct' | 'topic' | 'fanout' | 'headers';
    durable?: boolean;
  };
  queue?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
  };
}

/**
 * Default messaging configurations
 */
export const DEFAULT_MESSAGING_CONFIG: MessagingConfig = {
  provider: 'nats',
  url: 'nats://localhost:4222',
  options: {
    maxReconnectAttempts: 10,
    reconnectTimeWait: 2000,
    timeout: 5000,
  },
  subjects: {
    prefix: 'mcom',
    separator: '.',
  },
};

/**
 * Messaging configuration factory
 */
export class MessagingConfigFactory {
  static create(config?: Partial<MessagingConfig>): MessagingConfig {
    return {
      ...DEFAULT_MESSAGING_CONFIG,
      ...config,
      options: {
        ...DEFAULT_MESSAGING_CONFIG.options,
        ...config?.options,
      },
      subjects: {
        ...DEFAULT_MESSAGING_CONFIG.subjects,
        ...config?.subjects,
      },
    };
  }

  static createNATS(config?: Partial<NATSConfig>): NATSConfig {
    return {
      ...this.create(config),
      provider: 'nats',
      cluster: config?.cluster,
      jetstream: config?.jetstream,
    } as NATSConfig;
  }

  static createRabbitMQ(config?: Partial<RabbitMQConfig>): RabbitMQConfig {
    return {
      ...this.create(config),
      provider: 'rabbitmq',
      exchange: {
        name: 'mcom.events',
        type: 'topic',
        durable: true,
        ...config?.exchange,
      },
      queue: {
        durable: true,
        exclusive: false,
        autoDelete: false,
        ...config?.queue,
      },
    } as RabbitMQConfig;
  }

  static fromEnvironment(): MessagingConfig {
    const provider = (process.env.MESSAGING_PROVIDER as any) || 'nats';
    const url = process.env.MESSAGING_URL || 'nats://localhost:4222';

    return this.create({
      provider,
      url,
      options: {
        maxReconnectAttempts: parseInt(process.env.MESSAGING_MAX_RECONNECT_ATTEMPTS || '10'),
        reconnectTimeWait: parseInt(process.env.MESSAGING_RECONNECT_WAIT || '2000'),
        timeout: parseInt(process.env.MESSAGING_TIMEOUT || '5000'),
      },
    });
  }
}