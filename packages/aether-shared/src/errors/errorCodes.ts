import { ERROR_CODES, ErrorType } from "./contracts";

/**
 * Generates an array of error codes with a specific namespace and sequential numbering
 * @param namespace The namespace prefix for the error codes (should match an ErrorType)
 * @param count The number of error codes to generate
 * @returns Array of formatted error code strings
 */
export function generateErrorCodes(namespace: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `${namespace.toUpperCase()}_${(i + 1).toString().padStart(3, "0")}`
  );
}

/**
 * Utility function to get all error codes for a specific error type
 * @param type The error type to get codes for
 * @returns Array of error codes for the specified type
 */
export function getErrorCodesByType(type: ErrorType): string[] {
  const prefix = type.toUpperCase();
  return Object.entries(ERROR_CODES)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, value]) => value);
}


/**
 * Base error class for all Aether Engine errors
 * Provides standardized error handling with error codes, types, and optional context
 */
export class AetherError extends Error {
  /**
   * The error type derived from the error code
   */
  public readonly type: ErrorType;

  /**
   * Creates a new AetherError instance
   * @param code Unique error code identifying the error type (should be from ERROR_CODES)
   * @param message Human-readable error message
   * @param context Optional additional context information about the error
   */
  constructor(
    public readonly code: string,
    message?: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message || `Error code: ${code}`);
    this.name = "AetherError";

    // Determine error type from code prefix
    const codePrefix = code.split("_")[0]?.toLowerCase();
    this.type = Object.values(ErrorType).find(
      (type) => type.toUpperCase() === codePrefix?.toUpperCase()
    ) || ErrorType.GENERAL;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
