// Main application
export { AetherApp } from './AetherApp';

// Rendering
export { SceneManager } from './rendering/SceneManager';
export { CameraManager } from './rendering/CameraManager';

// Physics
export { PhysicsWorld } from './physics/PhysicsWorld';

// Entity system
export { EntityManager } from './entity/EntityManager';

// Asset management
export { AssetLoader } from './assets/AssetLoader';

// Networking
export { NetworkManager } from './network/NetworkManager';

export interface AetherAppOptions {
    // Core rendering options
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
    pixelRatio?: number;

    // Renderer configuration
    renderer?: {
      antialias?: boolean;
      alpha?: boolean;
      preserveDrawingBuffer?: boolean;
      powerPreference?: 'high-performance' | 'low-power' | 'default';
      shadowMap?: {
        enabled?: boolean;
        type?: THREE.ShadowMapType;
      };
    };

    // Scene configuration
    scene?: {
      background?: THREE.Color | THREE.Texture | string | number;
      fog?: {
        enabled?: boolean;
        color?: string | number;
        density?: number;
        near?: number;
        far?: number;
      };
    };

    // Camera settings
    camera?: {
      type?: 'perspective' | 'orthographic';
      fov?: number;
      near?: number;
      far?: number;
      position?: { x: number; y: number; z: number };
      lookAt?: { x: number; y: number; z: number };
    };

    // System enablement flags
    physics?: boolean | {
      gravity?: { x: number; y: number; z: number };
      debug?: boolean;
    };
    networking?: boolean | {
      serverUrl?: string;
      autoConnect?: boolean;
      reconnect?: boolean;
    };

    // Asset loading configuration
    assets?: {
      baseUrl?: string;
      preload?: string[];
      loadingStrategy?: 'eager' | 'lazy' | 'progressive';
    };

    // Performance options
    performance?: {
      targetFPS?: number;
      autoThrottle?: boolean;
      throttleWhenHidden?: boolean;
    };
  }
