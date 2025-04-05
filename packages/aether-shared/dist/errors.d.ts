export declare class AetherError extends Error {
    readonly code: string;
    readonly context?: Record<string, unknown> | undefined;
    constructor(code: string, message: string, context?: Record<string, unknown> | undefined);
}
export declare const ERROR_CODES: {
    PHYSICS_INIT_FAILED: string;
    NETWORK_CONNECTION_FAILED: string;
    ASSET_LOAD_FAILED: string;
};
