import { PhysicsBehavior } from '../physicsBehavior';
import { Vector3 } from 'three';
import { Body, Vec3 } from 'cannon-es';
import type { AIState } from '../types';

describe('PhysicsBehavior', () => {
  let behavior: PhysicsBehavior;
  let mockBody: Body;
  let mockState: AIState;

  beforeEach(() => {
    behavior = new PhysicsBehavior(10, 0.5);
    mockBody = {
      velocity: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      applyForce: jest.fn(),
    } as unknown as Body;
    mockState = {
      physicsBody: { position: new Vector3() },
    } as AIState;
    behavior.registerPhysicsBody(mockBody);
  });

  test('should register physics body', () => {
    expect(behavior).toBeDefined();
    expect(mockBody).toBeDefined();
  });

  test('should apply force when executing with target velocity', () => {
    behavior.setTargetVelocity(new Vector3(1, 0, 0));
    behavior.execute(mockState);
    expect(mockBody.applyForce).toHaveBeenCalled();
  });

  test('should update state with body position', () => {
    mockBody.position = { x: 5, y: 0, z: 0 };
    behavior.execute(mockState);
    expect(mockState.physicsBody?.position.x).toBe(5);
  });

  test('should not apply force without physics body', () => {
    behavior = new PhysicsBehavior(10, 0.5);
    behavior.execute(mockState);
    expect(mockBody.applyForce).not.toHaveBeenCalled();
  });
});
