import { ErrorType } from "./contracts";
import { AetherError, getErrorCodesByType } from "./errorCodes";

/**
 * Creates an error with the specified type, subtype, message, and optional context
 * @param type The error type
 * @param message Human-readable error message
 * @param subtype Optional subtype to specify which specific error code to use (e.g., "INIT_FAILED")
 * @param context Optional additional context information about the error
 * @returns A new AetherError instance
 */
export function createError(
  type: ErrorType,
  message: string,
  subtype?: string,
  context?: Record<string, unknown>
): AetherError {
  let code: string;
  const errorCodesForType = getErrorCodesByType(type);

  if (subtype) {
    const subtypeUpper = subtype.toUpperCase();
    const specificCode = errorCodesForType.find((errorCode) => {
      const codeParts = errorCode.split("_");
      if (codeParts.length >= 2) {
        return codeParts.slice(1).join("_") === subtypeUpper; // Check if subtype matches the suffix
      }
      return false;
    });

    if (specificCode) {
      code = specificCode;
    } else {
      // Fallback to the first error code for the type if subtype doesn't match
      code = errorCodesForType[0] || `${type.toUpperCase()}_001`; // Default if no codes for type
    }
  } else {
    // Use the first error code for the type if no subtype is specified
    code = errorCodesForType[0] || `${type.toUpperCase()}_001`; // Default if no codes for type
  }

  return new AetherError(code, message, context);
}
