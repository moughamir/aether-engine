import { Quaternion } from './quaternion';
import { Vector3 } from './vector3';

interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

type PhysicsShape = 'box' | 'sphere' | 'cylinder';

interface Physics {
  mass: number;
  shape: PhysicsShape;
  dimensions: Vector3;
}

export interface ComponentMap {
  transform?: Transform;
  physics?: Physics;
  // Add common component fields
  roomId?: string;
  ownerId?: string;
}
