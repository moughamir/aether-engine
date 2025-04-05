export class AetherError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AetherError';
  }
}

export const ERROR_CODES = {
  PHYSICS_INIT_FAILED: 'PHYSICS_001',
  NETWORK_CONNECTION_FAILED: 'NETWORK_001',
  ASSET_LOAD_FAILED: 'ASSET_001'
};