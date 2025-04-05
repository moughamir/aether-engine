import type {Body} from 'cannon'
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface ComponentMap {
  transform?: {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
  };
  physics?: {
    mass: number;
    shape: 'box' | 'sphere' | 'cylinder';
    dimensions: Vector3;
  };
  // Add common component fields
  roomId?: string;
  ownerId?: string;
}

export interface Entity<T extends ComponentMap = ComponentMap> {
  id: string;
  type: string;
  components: T;
  tags?: string[];
  body?: Body;
  createdAt?: Date;
  updatedAt?: Date;
}
