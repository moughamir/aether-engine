/**
 * Standardized error codes for the Aether Engine
 * These codes provide a consistent way to identify different types of errors
 * across the application and can be used for error handling, logging, and debugging.
 */
export const ERROR_CODES = {
  // Physics errors
  PHYSICS_INIT_FAILED: "PHYSICS_001",         // Physics system initialization failure
  PHYSICS_BODY_CREATION_FAILED: "PHYSICS_002", // Failed to create a physics body
  PHYSICS_CONSTRAINT_FAILED: "PHYSICS_003",    // Failed to create or apply a physics constraint

  // Network errors
  NETWORK_CONNECTION_FAILED: "NETWORK_001",    // Failed to establish network connection
  NETWORK_MESSAGE_INVALID: "NETWORK_002",      // Received an invalid network message
  NETWORK_TIMEOUT: "NETWORK_003",              // Network operation timed out

  // Asset errors
  ASSET_LOAD_FAILED: "ASSET_001",             // Failed to load an asset
  ASSET_NOT_FOUND: "ASSET_002",               // Asset not found at specified location
  ASSET_INVALID_FORMAT: "ASSET_003",          // Asset has an invalid or unsupported format

  // Entity errors
  ENTITY_CREATION_FAILED: "ENTITY_001",       // Failed to create an entity
  ENTITY_COMPONENT_INVALID: "ENTITY_002",     // Invalid component for entity

  // Rendering errors
  RENDER_CONTEXT_FAILED: "RENDER_001",        // Failed to create rendering context
  RENDER_SHADER_FAILED: "RENDER_002",         // Shader compilation or linking failed

  // General errors
  INITIALIZATION_FAILED: "GENERAL_001",       // General initialization failure
  INVALID_OPERATION: "GENERAL_002",           // Operation not valid in current state
  INVALID_ARGUMENT: "GENERAL_003",            // Invalid argument provided to function

  // Supabase errors
  SUPABASE_CONNECTION_FAILED: "SUPABASE_001", // Failed to establish connection with Supabase
  SUPABASE_QUERY_FAILED: "SUPABASE_002",      // Failed to execute Supabase query
  SUPABASE_AUTH_FAILED: "SUPABASE_003",       // Authentication with Supabase fai
  SUPABASE_INIT_FAILED: "SUPABASE_004",       // Initialization of Supabase failed
};

export enum ErrorType {
  INITIALIZATION = "initialization",
  RUNTIME = "runtime",
  PHYSICS = "physics",
  NETWORK = "network",
  ASSET = "asset",
  ENTITY = "entity",
  RENDERING = "rendering",
  GENERAL = "general",
  SUPABASE = "supabase",
}
