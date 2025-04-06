import { Vector3 } from "three";
import type { Body, Vec3 } from "cannon-es";
import { AIBehavior, type AIState } from "./types";

export class PhysicsBehavior extends AIBehavior {
  private body?: Body;
  private targetVelocity = new Vector3();

  constructor(
    private readonly maxSpeed: number,
    private readonly acceleration: number
  ) {
    super();
  }

  registerPhysicsBody(body: Body) {
    this.body = body;
  }

  execute(state: AIState) {
    if (!this.body || !state.physicsBody) return;

    const currentVel = new Vector3(
      this.body.velocity.x,
      this.body.velocity.y,
      this.body.velocity.z
    );

    const velDiff = this.targetVelocity.clone().sub(currentVel);
    const impulse = velDiff.multiplyScalar(this.acceleration);

    this.body.applyForce(
      { x: impulse.x, y: impulse.y, z: impulse.z } as Vec3,
      this.body.position
    );

    // Update AI state with physics body position
    state.physicsBody.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
  }

  setTargetVelocity(direction: Vector3) {
    this.targetVelocity = direction.normalize().multiplyScalar(this.maxSpeed);
  }

  dispose() {
    this.body = undefined;
    super.dispose();
  }
}
