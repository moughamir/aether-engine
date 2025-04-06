export interface CameraOptions {
  type?: "perspective" | "orthographic";
  fov?: number;
  near?: number;
  far?: number;
  position?: {
    x?: number;
    y?: number;
    z?: number;
  };
  lookAt?: {
    x?: number;
    y?: number;
    z?: number;
  };
}
