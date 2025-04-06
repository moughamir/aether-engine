import { useEffect, useState } from "react";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { useAether } from "./useAether";

export interface UsePhysicsOptions {
  mass?: number;
  shape?: "box" | "sphere" | "plane";
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
  };
  position?: THREE.Vector3;
  rotation?: THREE.Quaternion;
  material?: CANNON.Material;
  type?: "dynamic" | "static" | "kinematic";
}

export const usePhysics = (
  mesh: THREE.Object3D | null,
  options: UsePhysicsOptions = {}
) => {
  const { app } = useAether();
  const [body, setBody] = useState<CANNON.Body | null>(null);

  useEffect(() => {
    if (!app?.physicsWorld || !mesh) return;

    // Create physics body
    const bodyOptions: CANNON.BodyOptions = {
      mass: options.type === "static" ? 0 : options.mass || 1,
      type:
        options.type === "kinematic"
          ? CANNON.BODY_TYPES.KINEMATIC
          : options.type === "static"
            ? CANNON.BODY_TYPES.STATIC
            : CANNON.BODY_TYPES.DYNAMIC,
      material: options.material,
    };

    const body = new CANNON.Body(bodyOptions);

    // Add shape based on options
    if (options.shape === "box" || !options.shape) {
      const dimensions = options.dimensions || {};
      const halfWidth = (dimensions.width || 1) / 2;
      const halfHeight = (dimensions.height || 1) / 2;
      const halfDepth = (dimensions.depth || 1) / 2;

      body.addShape(
        new CANNON.Box(new CANNON.Vec3(halfWidth, halfHeight, halfDepth))
      );
    } else if (options.shape === "sphere") {
      const radius = options.dimensions?.radius || 0.5;
      body.addShape(new CANNON.Sphere(radius));
    } else if (options.shape === "plane") {
      body.addShape(new CANNON.Plane());
    }

    // Set initial position and rotation
    if (options.position) {
      body.position.set(
        options.position.x,
        options.position.y,
        options.position.z
      );
    } else if (mesh.position) {
      body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    }

    if (options.rotation) {
      body.quaternion.set(
        options.rotation.x,
        options.rotation.y,
        options.rotation.z,
        options.rotation.w
      );
    } else if (mesh.quaternion) {
      body.quaternion.set(
        mesh.quaternion.x,
        mesh.quaternion.y,
        mesh.quaternion.z,
        mesh.quaternion.w
      );
    }

    // Add body to physics world
    app.physicsWorld.world.addBody(body);
    setBody(body);

    // Update mesh position/rotation based on physics body
    const updateMesh = () => {
      if (mesh && body) {
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        mesh.quaternion.set(
          body.quaternion.x,
          body.quaternion.y,
          body.quaternion.z,
          body.quaternion.w
        );
      }
    };

    // Subscribe to physics updates
    app.physicsWorld.world.addEventListener("postStep", updateMesh);

    return () => {
      app?.physicsWorld?.world.removeEventListener("postStep", updateMesh);
      if (body) {
        app?.physicsWorld?.world.removeBody(body);
      }
    };
  }, [app, mesh, options]);

  return body;
};
