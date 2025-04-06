import type { ErrorType } from "./contracts"
import { createError } from "./createError"
import type { AetherError } from "./errorCodes"


export function tryCatch<T>(
  fn: () => T,
  errorType: ErrorType,
  errorMessage: string,
  errorSubtype?: string
): { success: true; result: T } | { success: false; error: AetherError } {
  try {
    const result = fn();
    return { success: true, result };
  } catch (e) {
    const context =
      e instanceof Error ? { originalError: e.message } : undefined;
    return {
      success: false,
      error: createError(errorType, errorMessage, errorSubtype, context),
    };
  }
}
export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
  errorType: ErrorType,
  errorMessage: string,
  errorSubtype?: string
): Promise<
  { success: true; result: T } | { success: false; error: AetherError }
> {
  try {
    const result = await fn();
    return { success: true, result };
  } catch (e) {
    const context =
      e instanceof Error ? { originalError: e.message } : undefined;
    return {
      success: false,
      error: createError(errorType, errorMessage, errorSubtype, context),
    };
  }
}
