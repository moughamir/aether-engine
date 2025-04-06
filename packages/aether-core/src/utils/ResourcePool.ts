/**
 * A generic object pool implementation to reduce garbage collection pressure
 * by reusing objects instead of creating new ones each time.
 */
export class ResourcePool {
  private static pools = new Map<string, any[]>();
  private static factories = new Map<string, () => any>();
  private static resetters = new Map<string, (obj: any) => void>();
  private static maxPoolSize = new Map<string, number>();

  /**
   * Register a new resource type with the pool
   * @param type The unique identifier for this resource type
   * @param factory A function that creates a new instance of the resource
   * @param resetter A function that resets an instance to its initial state
   * @param maxSize Maximum number of objects to keep in the pool (default: 100)
   */
  public static register<T>(
    type: string,
    factory: () => T,
    resetter: (obj: T) => void,
    maxSize: number = 100
  ): void {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }
    this.factories.set(type, factory);
    this.resetters.set(type, resetter);
    this.maxPoolSize.set(type, maxSize);
  }

  /**
   * Acquire an object from the pool, or create a new one if the pool is empty
   * @param type The type of resource to acquire
   * @returns A new or recycled instance of the requested resource
   */
  public static acquire<T>(type: string): T {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }

    const pool = this.pools.get(type)!;

    if (pool.length > 0) {
      return pool.pop() as T;
    }

    // If no factory is registered, create a default one for simple objects
    if (!this.factories.has(type)) {
      this.factories.set(type, () => ({}));
    }

    return this.factories.get(type)!() as T;
  }

  /**
   * Release an object back to the pool
   * @param type The type of resource being released
   * @param obj The object to return to the pool
   */
  public static release<T>(type: string, obj: T): void {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }

    const pool = this.pools.get(type)!;
    const maxSize = this.maxPoolSize.get(type) || 100;

    // Only add to pool if we haven't reached max size
    if (pool.length < maxSize) {
      // Reset the object if a resetter is registered
      if (this.resetters.has(type)) {
        this.resetters.get(type)!(obj);
      }

      pool.push(obj);
    }
  }

  /**
   * Clear all objects from a specific pool
   * @param type The type of resource pool to clear
   */
  public static clear(type: string): void {
    if (this.pools.has(type)) {
      this.pools.set(type, []);
    }
  }

  /**
   * Clear all pools
   */
  public static clearAll(): void {
    this.pools.clear();
  }

  /**
   * Get the current size of a specific pool
   * @param type The type of resource pool
   * @returns The number of objects currently in the pool
   */
  public static getPoolSize(type: string): number {
    return this.pools.has(type) ? this.pools.get(type)!.length : 0;
  }
}
