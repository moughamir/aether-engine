import {World, Material, Body,
   BodyOptions, SAPBroadphase, GSSolver} from 'cannon-es';
import * as THREE from 'three';
import CannonDebugger from 'cannon-es-debugger';

import { Vector3, Lifecycle } from '@aether/shared';

export interface PhysicsWorldOptions {
  gravity?: THREE.Vector3;
  iterations?: number;
  broadphase?: 'naive' | 'sap';
  fixedTimeStep?: number;
  maxSubSteps?: number;
}

export class PhysicsWorld implements Lifecycle {
  public world: World;
  private fixedTimeStep: number = 1/60;
  private maxSubSteps: number = 3;
  private debugger: { update: () => void } | null = null;

  private options: PhysicsWorldOptions;
  private isRunning: boolean = false;

  constructor(options: PhysicsWorldOptions = {}) {
    this.options = options;
    this.world = new World();
  }

  /**
   * Updates the physics simulation
   * @param deltaTime Time since last update in seconds
   */
  public update(deltaTime: number): void {
    if (!this.isRunning) return;
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
  }

  /**
   * Set the gravity of the physics world
   * @param gravity Vector3 gravity direction and magnitude
   */
  public setGravity(gravity: Vector3 | THREE.Vector3): void {
    this.applyGravity(gravity);
  }

  /**
   * Apply gravity settings to the physics world
   * @param gravity Vector3 gravity direction and magnitude
   * @private
   */
  private applyGravity(gravity: Vector3 | THREE.Vector3): void {
    this.world.gravity.set(
      gravity.x || 0,
      gravity.y || -9.82,
      gravity.z || 0
    );
  }

  /**
   * Set the fixed time step for physics simulation
   * @param timeStep Time step in seconds
   */
  public setFixedTimeStep(timeStep: number): void {
    this.fixedTimeStep = timeStep;
  }

  /**
   * Get the current fixed time step
   * @returns Current fixed time step in seconds
   */
  public getFixedTimeStep(): number {
    return this.fixedTimeStep;
  }

  /**
   * Set the maximum number of sub steps for physics simulation
   * @param steps Maximum number of sub steps
   */
  public setMaxSubSteps(steps: number): void {
    this.maxSubSteps = steps;
  }

  /**
   * Get the current maximum number of sub steps
   * @returns Current maximum number of sub steps
   */
  public getMaxSubSteps(): number {
    return this.maxSubSteps;
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

  /**
   * Starts the physics simulation
   * Initializes the world with the provided options
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;

    // Configure world
    if (this.options.gravity) {
      this.setGravity(this.options.gravity);
    }

    if (this.options.iterations) {
      (this.world.solver as GSSolver).iterations = this.options.iterations;
    }

    // Set broadphase
    if (this.options.broadphase === 'sap') {
      this.world.broadphase = new SAPBroadphase(this.world);
    }

    // Set simulation parameters if provided
    if (this.options.fixedTimeStep) {
      this.setFixedTimeStep(this.options.fixedTimeStep);
    }

    if (this.options.maxSubSteps) {
      this.setMaxSubSteps(this.options.maxSubSteps);
    }

    this.isRunning = true;
  }

  /**
   * Stops the physics simulation
   */
  public stop(): void {
    this.isRunning = false;
  }

  /**
   * Cleans up resources used by the physics world
   * Implements the Disposable interface
   */
  public dispose(): void {
    this.stop();

    // Clean up physics bodies
    this.world.bodies.forEach(body => this.world.removeBody(body));
    this.world.contacts = [];
    // Clear any remaining contact equations
    (this.world.narrowphase as any).contactEquations = [];

    // Clean up debugger
    this.debugger = null;
  }
}
