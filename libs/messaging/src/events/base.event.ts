/**
 * Base event interface
 */
export interface BaseEvent {
  id: string;
  type: string;
  version: string;
  timestamp: Date;
  source: string;
  tenantId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Abstract base event class
 */
export abstract class Event implements BaseEvent {
  public readonly id: string;
  public readonly timestamp: Date;
  public readonly version: string = '1.0';
  public readonly source: string;

  constructor(
    public readonly type: string,
    source: string,
    public readonly tenantId?: string,
    public readonly userId?: string,
    public readonly metadata?: Record<string, any>
  ) {
    this.id = this.generateId();
    this.timestamp = new Date();
    this.source = source;
  }

  private generateId(): string {
    // Simple ID generation - will use proper UUID when available
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}