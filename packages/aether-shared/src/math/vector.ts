import type { Vector3 } from "./contracts"


/**
 * Vector3 utility functions
 */
export const Vec3 = {
  /**
   * Creates a new Vector3
   */
  create(x = 0, y = 0, z = 0): Vector3 {
    return { x, y, z };
  },

  /**
   * Adds two vectors
   */
  add(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  },

  /**
   * Subtracts vector b from vector a
   */
  subtract(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z,
    };
  },

  /**
   * Multiplies a vector by a scalar
   */
  scale(v: Vector3, scalar: number): Vector3 {
    return {
      x: v.x * scalar,
      y: v.y * scalar,
      z: v.z * scalar,
    };
  },

  /**
   * Calculates the dot product of two vectors
   */
  dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  /**
   * Calculates the cross product of two vectors
   */
  cross(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  /**
   * Calculates the length of a vector
   */
  length(v: Vector3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },

  /**
   * Normalizes a vector
   */
  normalize(v: Vector3): Vector3 {
    const len = Vec3.length(v);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return {
      x: v.x / len,
      y: v.y / len,
      z: v.z / len,
    };
  },

  /**
   * Calculates the distance between two vectors
   */
  distance(a: Vector3, b: Vector3): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  /**
   * Linearly interpolates between two vectors
   */
  lerp(a: Vector3, b: Vector3, t: number): Vector3 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  },

  /**
   * Reflects a vector off the surface of a normal
   */
  reflect(v: Vector3, normal: Vector3): Vector3 {
    const normalizedNormal = Vec3.normalize(normal);
    const dotProduct = Vec3.dot(v, normalizedNormal);
    return Vec3.subtract(v, Vec3.scale(normalizedNormal, 2 * dotProduct));
  },
  /**
   * Projects one vector onto another
   */
  project(v: Vector3, onto: Vector3): Vector3 {
    const ontoNormalized = Vec3.normalize(onto);
    const dot = Vec3.dot(v, ontoNormalized);
    return Vec3.scale(ontoNormalized, dot);
  },
  /**
   * Clamps a vector's magnitude to the given max length
   */
  clampMagnitude(v: Vector3, maxLength: number): Vector3 {
    const len = Vec3.length(v);
    if (len > maxLength) {
      return Vec3.scale(Vec3.normalize(v), maxLength);
    }
    return { ...v };
  },
};
