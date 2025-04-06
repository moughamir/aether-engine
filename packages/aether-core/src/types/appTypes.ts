import type { CameraOptions } from "./cameraTypes";

export interface AetherAppOptions {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  pixelRatio?: number;
  renderer?: {
    antialias?: boolean;
    alpha?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: string;
    shadowMap?: {
      enabled: boolean;
      type?: THREE.ShadowMapType;
    };
  };
  scene?: {
    background?: string | number | THREE.Color | THREE.Texture;
    fog?: {
      enabled: boolean;
      color?: string | number;
      density?: number;
      near?: number;
      far?: number;
    };
  };
  assets?: {
    baseUrl?: string;
    preload?: string[];
  };
  physics?:
    | boolean
    | {
        gravity?: THREE.Vector3;
        debug?: boolean;
      };
  networking?:
    | boolean
    | {
        serverUrl?: string;
        autoConnect?: boolean;
      };
  performance?: {
    targetFPS?: number;
    throttleWhenHidden?: boolean;
  };
  camera?: CameraOptions;
}
