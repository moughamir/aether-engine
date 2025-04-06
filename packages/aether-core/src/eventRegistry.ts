export class EventRegistry {
  private listeners = new Map<
    string,
    Array<{ handler: Function; wrapper: Function }>
  >();

  add<T>(
    type: string,
    handler: (data: T) => void,
    registerFn: (type: string, wrapper: Function) => void
  ) {
    const wrapper = (message: T) => handler(message);
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push({ handler, wrapper });
    registerFn(type, wrapper);
  }

  remove(
    type: string,
    handler?: Function,
    unregisterFn?: (type: string, wrapper: Function) => void
  ) {
    const listeners = this.listeners.get(type) || [];
    const filtered = handler
      ? listeners.filter((l) => l.handler !== handler)
      : [];

    if (handler && unregisterFn) {
      listeners
        .filter((l) => l.handler === handler)
        .forEach((l) => unregisterFn(type, l.wrapper));
    }

    this.listeners.set(type, filtered);
  }

  reattachAll(registerFn: (type: string, wrapper: Function) => void) {
    this.listeners.forEach((listeners, type) => {
      listeners.forEach(({ wrapper }) => registerFn(type, wrapper));
    });
  }
}
