import { DomainEvent } from '../../domain/events/DomainEvent';

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

export class InMemoryEventBus {
  private static instance: InMemoryEventBus;
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  private constructor() {}

  public static getInstance(): InMemoryEventBus {
    if (!InMemoryEventBus.instance) {
      InMemoryEventBus.instance = new InMemoryEventBus();
    }
    return InMemoryEventBus.instance;
  }

  public subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  public async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName);
    if (handlers) {
      console.log(`[EventBus] Publishing event: ${event.eventName}`);
      await Promise.all(handlers.map(handler => handler(event)));
    }
  }
}
