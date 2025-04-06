
import type { Quaternion, Vector3 } from "../math"


export interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

export type PhysicsShape = 'box' | 'sphere' | 'cylinder';

export interface Physics {
  mass: number;
  shape: PhysicsShape;
  dimensions: Vector3;
}

export interface ComponentMap {
  transform?: Transform;
  physics?: Physics;
  roomId?: string;
  ownerId?: string;
}
