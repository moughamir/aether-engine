/**
 * Generic event registry for managing event subscriptions
 * with automatic cleanup and reattachment capabilities
 */
export class EventRegistry<EventType extends string | number = string> {
  private listeners = new Map<
    EventType,
    Array<{ handler: Function; wrapper: Function }>
  >();

  /**
   * Register an event handler with automatic wrapper creation
   */
  register<T>(
    type: EventType,
    handler: (data: T) => void,
    attachFn: (type: EventType, wrapper: Function) => void
  ): void {
    // Create wrapper function to handle data transformation if needed
    const wrapper = (rawData: any) => {
      // Handle both raw data and {data: T} format
      const data = rawData && typeof rawData === 'object' && 'data' in rawData
        ? rawData.data
        : rawData;
      handler(data);
    };

    // Initialize listener array if needed
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    // Store both original handler and wrapper
    this.listeners.get(type)!.push({ handler, wrapper });

    // Attach to event source
    attachFn(type, wrapper);
  }

  /**
   * Unregister event handlers
   */
  unregister(
    type: EventType,
    handler?: Function,
    detachFn?: (type: EventType, wrapper: Function) => void
  ): void {
    if (!this.listeners.has(type)) return;

    const listeners = this.listeners.get(type)!;

    if (handler && detachFn) {
      // Remove specific handler
      const matchingListeners = listeners.filter(l => l.handler === handler);
      matchingListeners.forEach(l => detachFn(type, l.wrapper));

      // Update stored listeners
      this.listeners.set(
        type,
        listeners.filter(l => l.handler !== handler)
      );
    } else if (detachFn) {
      // Remove all handlers for this type
      listeners.forEach(l => detachFn(type, l.wrapper));
      this.listeners.delete(type);
    }
  }

  /**
   * Reattach all registered event handlers
   */
  reattachAll(attachFn: (type: EventType, wrapper: Function) => void): void {
    this.listeners.forEach((listeners, type) => {
      listeners.forEach(({ wrapper }) => attachFn(type, wrapper));
    });
  }

  /**
   * Clear all event registrations
   */
  clear(detachFn?: (type: EventType, wrapper: Function) => void): void {
    if (detachFn) {
      this.listeners.forEach((listeners, type) => {
        listeners.forEach(({ wrapper }) => detachFn(type, wrapper));
      });
    }
    this.listeners.clear();
  }
}
