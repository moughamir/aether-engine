export interface PerformanceStats {
  fps: number;
  frameTime: number;
  physicsTime: number;
}

export type PerformanceOptions = {
  targetFPS?: number;
  throttleWhenHidden?: boolean;
};
