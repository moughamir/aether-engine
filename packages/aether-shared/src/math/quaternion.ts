import type { Quaternion , Vector3} from "./contracts"


/**
 * Quaternion utility functions
 */
export const Quat = {
  /**
   * Creates a new identity quaternion
   */
  identity(): Quaternion {
    return { x: 0, y: 0, z: 0, w: 1 };
  },

  /**
   * Creates a quaternion from Euler angles (in radians)
   */
  fromEuler(x: number, y: number, z: number): Quaternion {
    const cx = Math.cos(x / 2);
    const sx = Math.sin(x / 2);
    const cy = Math.cos(y / 2);
    const sy = Math.sin(y / 2);
    const cz = Math.cos(z / 2);
    const sz = Math.sin(z / 2);

    return {
      x: sx * cy * cz - cx * sy * sz,
      y: cx * sy * cz + sx * cy * sz,
      z: cx * cy * sz - sx * sy * cz,
      w: cx * cy * cz + sx * sy * sz,
    };
  },

  /**
   * Multiplies two quaternions
   */
  multiply(a: Quaternion, b: Quaternion): Quaternion {
    return {
      x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
      y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
      z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
      w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    };
  },

  /**
   * Normalizes a quaternion
   */
  normalize(q: Quaternion): Quaternion {
    const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
    if (len === 0) return { x: 0, y: 0, z: 0, w: 1 };
    return {
      x: q.x / len,
      y: q.y / len,
      z: q.z / len,
      w: q.w / len,
    };
  },

  /**
   * Converts a quaternion to Euler angles (in radians)
   */
  toEuler(q: Quaternion): Vector3 {
    // Normalize the quaternion
    const norm = Quat.normalize(q);
    const { x, y, z, w } = norm;

    // Calculate Euler angles
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (w * y - z * x);
    let pitch;
    if (Math.abs(sinp) >= 1) {
      pitch = (Math.sign(sinp) * Math.PI) / 2; // Use 90 degrees if out of range
    } else {
      pitch = Math.asin(sinp);
    }

    const siny_cosp = 2 * (w * z + x * y);
    const cosy_cosp = 1 - 2 * (y * y + z * z);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return { x: roll, y: pitch, z: yaw };
  },

  /**
   * Spherical linear interpolation between two quaternions
   */
  slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    // Calculate angle between them
    let cosHalfTheta = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z;

    // If a=b or a=-b then theta = 0 and we can return a
    if (Math.abs(cosHalfTheta) >= 1.0) {
      return { ...a };
    }

    // Calculate temporary values
    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    // If theta = 180 degrees then result is not fully defined
    // We could rotate around any axis normal to a or b
    if (Math.abs(sinHalfTheta) < 0.001) {
      return {
        x: a.x * 0.5 + b.x * 0.5,
        y: a.y * 0.5 + b.y * 0.5,
        z: a.z * 0.5 + b.z * 0.5,
        w: a.w * 0.5 + b.w * 0.5,
      };
    }

    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    return {
      x: a.x * ratioA + b.x * ratioB,
      y: a.y * ratioA + b.y * ratioB,
      z: a.z * ratioA + b.z * ratioB,
      w: a.w * ratioA + b.w * ratioB,
    };
  },
};
