import { PhysicsWorld } from '@aether/core';
import { Vector3 } from '@aether/shared/math';

export function initPhysicsScene() {
  const physics = new PhysicsWorld({
    gravity: new Vector3(0, -9.81, 0)
  });

  // Create dynamic sphere
  const sphere = physics.createRigidBody({
    position: new Vector3(0, 10, 0),
    shape: 'sphere',
    mass: 1,
    radius: 0.5
  });

  // Create static ground
  physics.createStaticBody({
    position: Vector3.ZERO,
    shape: 'plane'
  });

  return { physics, sphere };
}
