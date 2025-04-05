import CANNON from 'cannon-es';
import { Vector3 } from '@aether/shared';

export interface PhysicsWorldOptions {
  gravity?: Vector3;
  iterations?: number;
  broadphase?: 'naive' | 'sap';
}

export class PhysicsWorld {
  public world: CANNON.World;
  private fixedTimeStep: number = 1/60;
  private maxSubSteps: number = 3;
  private bodies: CANNON.Body[] = [];
  
  constructor(options: PhysicsWorldOptions = {}) {
    this.world = new CANNON.World();
    
    // Configure world
    this.world.gravity.set(
      options.gravity?.x || 0, 
      options.gravity?.y || -9.82, 
      options.gravity?.z || 0
    );
    
    if (options.iterations) {
      this.world.solver.iterations = options.iterations;
    }
    
    // Set broadphase
    if (options.broadphase === 'sap') {
      this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    }
  }
  
  public update(deltaTime: number): void {
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
  }
  
  // Add proper type for body options
  public createBody(options: CANNON.IBodyOptions): CANNON.Body {
    const body = new CANNON.Body({
      ...options,
      material: options.material || new CANNON.Material()
    });
    this.world.addBody(body);
    return body;
  }

  // Add proper cleanup
  public dispose(): void {
    this.world.bodies.forEach(body => this.world.removeBody(body));
    this.world.contacts = [];
    this.world.narrowphase.contactEquations = [];
  }
}