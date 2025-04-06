/**
 * Shared lifecycle utilities for Aether Engine components
 */

/**
 * Throttles a function to limit how often it can be called
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 */
export function throttle(fn: (...args: any[]) => void, limit: number) {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      fn(...args);
      lastCall = now;
    }
  };
}

/**
 * Debounces a function to delay its execution until after a specified time
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Asserts that a condition is true, throwing an error if it's not
 * @param condition Condition to check
 * @param message Error message if condition is false
 */
export function invariant(condition: boolean, message: string) {
  if (!condition) throw new Error(`Invariant violation: ${message}`);
}

/**
 * Interface for objects that can be disposed
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Interface for objects that can be started and stopped
 */
export interface Startable {
  start(): Promise<void>;
  stop(): void;
}

/**
 * Interface for objects with a lifecycle (combination of Disposable and Startable)
 */
export interface Lifecycle extends Disposable, Startable {}

/**
 * Memoizes a function to cache its results based on arguments
 * @param fn Function to memoize
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
