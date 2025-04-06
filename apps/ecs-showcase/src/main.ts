import { EntityManager } from '@aether/core';
import { Vector3, Quaternion } from '@aether/shared/math';

const em = new EntityManager();

// Create entities with Transform components
for (let i = 0; i < 100; i++) {
  em.createEntity({
    position: new Vector3(i * 2, 0, 0),
    rotation: Quaternion.IDENTITY,
    scale: Vector3.ONE
  });
}

// System for rotating entities
em.registerSystem((entities) => {
  entities.forEach(entity => {
    entity.rotation = Quaternion.multiply(
      entity.rotation,
      Quaternion.fromEulerAngles(0, 0.01, 0)
    );
  });
});

// Start simulation loop
setInterval(() => em.update(), 16);
