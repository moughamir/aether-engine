// Shared Interfaces
import * as THREE from "three";

export interface ShadowMap {
  enabled: boolean;
  type?: THREE.ShadowMapType;
}

export interface RendererOptions {
  antialias?: boolean;
  alpha?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: PowerPreference;
  shadowMap?: ShadowMap;
}

export interface CameraOptions {
  type?: CameraViewType;
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: THREE.Vector3;
  lookAt?: THREE.Vector3;
  enableControls?: boolean;
}

export interface SceneOptions {
  background?: THREE.Color | THREE.Texture | string | number;
  fog?: {
    enabled: boolean;
    color?: THREE.ColorRepresentation;
    density?: number;
    near?: number;
    far?: number;
  };
}

export interface Disposable {
  dispose(): void;
}

export interface Initializable {
  initialize(options?: Record<string, any>): Promise<void>;
}

// Simplified Physics options
export interface PhysicsOptions {
  gravity?: THREE.Vector3;
  debug?: boolean;
  solver?: "GS" | "NS";
}

export interface AssetLoadingOptions {
  concurrency?: number;
  retries?: number;
  cacheStrategy?: "memory" | "local";
}
export type AetherAppConfig = Pick<
  AetherAppOptions,
  "renderer" | "scene" | "camera" | "performance"
> & {
  physics?: PhysicsOptions;
  networking?: NetworkingOptions;
  assets?: AssetLoadingOptions;
};

export interface AetherAppOptions {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  pixelRatio?: number;
  renderer?: RendererOptions;
  scene?: SceneOptions;
  camera?: CameraOptions;
  assets?: {
    baseUrl?: string;
    preload?: string[];
    loadingStrategy?: LoadingStrategy;
  };
  physics?: boolean | PhysicsOptions;
  networking?: boolean | NetworkingOptions;
  performance?: {
    targetFPS?: number;
    autoThrottle?: boolean;
    throttleWhenHidden?: boolean;
  };
  [key: string]: any;
}


export interface NetworkingOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  reconnectStrategy?: {
    maxAttempts?: number;
    baseDelay?: number;
    randomizationFactor?: number;
  };
  messageHandling?: {
    bufferSize?: number;
    dropThreshold?: number;
  };
}

export type PowerPreference = "default" | "high-performance" | "low-power";
export type LoadingStrategy = "eager" | "lazy" | "progressive";

export type CameraViewType = "perspective" | "orthographic";
export type AssetType = "texture" | "model" | "audio";
