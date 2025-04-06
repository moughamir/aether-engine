/**
 * Shared error utilities for Aether Engine components
 */
import { AetherError, ERROR_CODES } from '../errors';

/**
 * Error types for different components of the Aether Engine
 */
export enum ErrorType {
    INITIALIZATION = 'initialization',
    RUNTIME = 'runtime',
  PHYSICS = 'physics',
  NETWORK = 'network',
  ASSET = 'asset',
  ENTITY = 'entity',
  RENDERING = 'rendering',
  GENERAL = 'general'
}

/**
 * Creates a standardized error with proper code and context
 * @param type The type of error
 * @param message Error message
 * @param context Additional context for the error
 */
export function createError(type: ErrorType, message: string, context?: Record<string, unknown>): AetherError {
  let code: string;

  switch (type) {
    case ErrorType.PHYSICS:
      code = ERROR_CODES.PHYSICS_INIT_FAILED;
      break;
    case ErrorType.NETWORK:
      code = ERROR_CODES.NETWORK_CONNECTION_FAILED;
      break;
    case ErrorType.ASSET:
      code = ERROR_CODES.ASSET_LOAD_FAILED;
      break;
    default:
      code = `${type.toUpperCase()}_001`;
  }

  return new AetherError(code, message, context);
}

/**
 * Safely executes a function and returns either the result or an error
 * @param fn Function to execute
 * @param errorType Type of error if the function fails
 * @param errorMessage Message to use if the function fails
 */
export function tryCatch<T>(
  fn: () => T,
  errorType: ErrorType,
  errorMessage: string
): { success: true; result: T } | { success: false; error: AetherError } {
  try {
    const result = fn();
    return { success: true, result };
  } catch (e) {
    const context = e instanceof Error ? { originalError: e.message } : undefined;
    return { success: false, error: createError(errorType, errorMessage, context) };
  }
}

/**
 * Safely executes an async function and returns either the result or an error
 * @param fn Async function to execute
 * @param errorType Type of error if the function fails
 * @param errorMessage Message to use if the function fails
 */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
  errorType: ErrorType,
  errorMessage: string
): Promise<{ success: true; result: T } | { success: false; error: AetherError }> {
  try {
    const result = await fn();
    return { success: true, result };
  } catch (e) {
    const context = e instanceof Error ? { originalError: e.message } : undefined;
    return { success: false, error: createError(errorType, errorMessage, context) };
  }
}
