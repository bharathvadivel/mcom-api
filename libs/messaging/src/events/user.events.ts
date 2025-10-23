import { Event } from './base.event';

/**
 * User created event
 */
export class UserCreatedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    },
    tenantId?: string,
    userId?: string
  ) {
    super('user.created', 'auth-service', tenantId, userId);
  }
}

/**
 * User updated event
 */
export class UserUpdatedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      changes: string[];
    },
    tenantId?: string,
    userId?: string
  ) {
    super('user.updated', 'auth-service', tenantId, userId);
  }
}

/**
 * User deleted event
 */
export class UserDeletedEvent extends Event {
  constructor(
    public readonly data: {
      id: string;
      email: string;
    },
    tenantId?: string,
    userId?: string
  ) {
    super('user.deleted', 'auth-service', tenantId, userId);
  }
}