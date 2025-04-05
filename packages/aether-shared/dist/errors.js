export class AetherError extends Error {
    constructor(code, message, context) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: context
        });
        this.name = 'AetherError';
    }
}
export const ERROR_CODES = {
    PHYSICS_INIT_FAILED: 'PHYSICS_001',
    NETWORK_CONNECTION_FAILED: 'NETWORK_001',
    ASSET_LOAD_FAILED: 'ASSET_001'
};
