import {World, Material, Body,
   BodyOptions, SAPBroadphase, GSSolver} from 'cannon-es';
import * as THREE from 'three';
import CannonDebugger, { DebugOptions } from 'cannon-es-debugger';

import { Vector3 } from '@aether/shared';

export interface PhysicsWorldOptions {
  gravity?: Vector3;
  iterations?: number;
  broadphase?: 'naive' | 'sap';
}

export class PhysicsWorld {
  public world: World;
  private fixedTimeStep: number = 1/60;
  private maxSubSteps: number = 3;
  private debugger: { update: () => void } | null = null;

  constructor(options: PhysicsWorldOptions = {}) {
    this.world = new World();

    // Configure world
    this.world.gravity.set(
      options.gravity?.x || 0,
      options.gravity?.y || -9.82,
      options.gravity?.z || 0
    );

    if (options.iterations) {
      (this.world.solver as GSSolver).iterations = options.iterations;
    }

    // Set broadphase
    if (options.broadphase === 'sap') {
      this.world.broadphase = new SAPBroadphase(this.world);
    }
  }

  public update(deltaTime: number): void {
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
  }

  /**
   * Set the gravity of the physics world
   * @param gravity Vector3 gravity direction and magnitude
   */
  public setGravity(gravity: Vector3): void {
    this.world.gravity.set(
      gravity.x || 0,
      gravity.y || -9.82,
      gravity.z || 0
    );
  }

  /**
   * Enable debug visualization of physics bodies
   * @param scene The scene to add debug visualization to
   */
  public enableDebug(scene: THREE.Scene): void {
    console.log('Physics debug visualization enabled');

    // Create the debugger instance
    this.debugger = CannonDebugger(scene, this.world, {
      // Optional configuration
      color: 0x00ff00, // Default is red 0xff0000
      scale: 1,        // Scale of the debug shapes
      onInit: (_body, mesh) => {
        // Optional callback when a body is initialized with a debug mesh
        mesh.visible = true; // All meshes are visible by default
      }
    });
  }

  /**
   * Update the debug visualization
   * Should be called in the render loop after physics world update
   */
  public updateDebug(): void {
    if (this.debugger) {
      this.debugger.update();
    }
  }

  // Add proper type for body options
  public createBody(options: BodyOptions): Body {
    const body = new Body({
      ...options,
      material: options?.material || new Material()
    });
    this.world.addBody(body);
    return body;
  }

  // Add proper cleanup
  public dispose(): void {
    this.world.bodies.forEach(body => this.world.removeBody(body));
    this.world.contacts = [];
    // Clear any remaining contact equations
    (this.world.narrowphase as any).contactEquations = [];

    // Clean up debugger
    this.debugger = null;
  }
}
