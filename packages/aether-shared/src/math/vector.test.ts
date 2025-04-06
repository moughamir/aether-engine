import { Vec3 } from './vector';
import { Vector3 } from './contracts';

describe('Vec3', () => {
  describe('create', () => {
    it('should create a vector with default values', () => {
      const v = Vec3.create();
      expect(v).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should create a vector with specified values', () => {
      const v = Vec3.create(1, 2, 3);
      expect(v).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('add', () => {
    it('should add two vectors', () => {
      const a: Vector3 = { x: 1, y: 2, z: 3 };
      const b: Vector3 = { x: 4, y: 5, z: 6 };
      const result = Vec3.add(a, b);
      expect(result).toEqual({ x: 5, y: 7, z: 9 });
    });
  });

  describe('subtract', () => {
    it('should subtract two vectors', () => {
      const a: Vector3 = { x: 5, y: 7, z: 9 };
      const b: Vector3 = { x: 4, y: 5, z: 6 };
      const result = Vec3.subtract(a, b);
      expect(result).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('scale', () => {
    it('should scale a vector by a scalar', () => {
      const v: Vector3 = { x: 1, y: 2, z: 3 };
      const result = Vec3.scale(v, 2);
      expect(result).toEqual({ x: 2, y: 4, z: 6 });
    });
  });

  describe('dot', () => {
    it('should calculate the dot product', () => {
      const a: Vector3 = { x: 1, y: 2, z: 3 };
      const b: Vector3 = { x: 4, y: 5, z: 6 };
      const result = Vec3.dot(a, b);
      expect(result).toBe(32);
    });
  });

  describe('cross', () => {
    it('should calculate the cross product', () => {
      const a: Vector3 = { x: 1, y: 0, z: 0 };
      const b: Vector3 = { x: 0, y: 1, z: 0 };
      const result = Vec3.cross(a, b);
      expect(result).toEqual({ x: 0, y: 0, z: 1 });
    });
  });

  describe('length', () => {
    it('should calculate vector length', () => {
      const v: Vector3 = { x: 3, y: 4, z: 0 };
      const result = Vec3.length(v);
      expect(result).toBe(5);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector', () => {
      const v: Vector3 = { x: 3, y: 4, z: 0 };
      const result = Vec3.normalize(v);
      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
      expect(result.z).toBe(0);
    });

    it('should handle zero vector', () => {
      const v: Vector3 = { x: 0, y: 0, z: 0 };
      const result = Vec3.normalize(v);
      expect(result).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('distance', () => {
    it('should calculate distance between vectors', () => {
      const a: Vector3 = { x: 1, y: 2, z: 3 };
      const b: Vector3 = { x: 4, y: 6, z: 9 };
      const result = Vec3.distance(a, b);
      expect(result).toBeCloseTo(7.07106);
    });
  });

  describe('lerp', () => {
    it('should linearly interpolate between vectors', () => {
      const a: Vector3 = { x: 1, y: 2, z: 3 };
      const b: Vector3 = { x: 4, y: 6, z: 9 };
      const result = Vec3.lerp(a, b, 0.5);
      expect(result).toEqual({ x: 2.5, y: 4, z: 6 });
    });
  });

  describe('reflect', () => {
    it('should reflect a vector off a surface', () => {
      const v: Vector3 = { x: 1, y: -1, z: 0 };
      const normal: Vector3 = { x: 0, y: 1, z: 0 };
      const result = Vec3.reflect(v, normal);
      expect(result).toEqual({ x: 1, y: 1, z: 0 });
    });
  });

  describe('project', () => {
    it('should project one vector onto another', () => {
      const v: Vector3 = { x: 3, y: 4, z: 0 };
      const onto: Vector3 = { x: 1, y: 0, z: 0 };
      const result = Vec3.project(v, onto);
      expect(result).toEqual({ x: 3, y: 0, z: 0 });
    });
  });

  describe('clampMagnitude', () => {
    it('should clamp vector magnitude', () => {
      const v: Vector3 = { x: 3, y: 4, z: 0 };
      const result = Vec3.clampMagnitude(v, 3);
      expect(Vec3.length(result)).toBeCloseTo(3);
      expect(result.x).toBeCloseTo(1.8);
      expect(result.y).toBeCloseTo(2.4);
      expect(result.z).toBe(0);
    });

    it('should not clamp when below max length', () => {
      const v: Vector3 = { x: 1, y: 2, z: 2 };
      const result = Vec3.clampMagnitude(v, 4);
      expect(result).toEqual(v);
    });
  });
});
