import {
  World,
  Material,
  Body,
  BodyOptions,
  SAPBroadphase,
  GSSolver,
} from "cannon-es";
import * as THREE from "three";
import CannonDebugger from "cannon-es-debugger";

import { Vector3, Lifecycle } from "@aether/shared";
import type { PhysicsWorldOptions } from "./types";

export class PhysicsWorld implements Lifecycle {
  public world: World;
  private fixedTimeStep: number = 1 / 60;
  private maxSubSteps: number = 3;
  private debugger: { update: () => void } | null = null;

  private options: PhysicsWorldOptions;
  private isRunning: boolean = false;

  constructor(options: PhysicsWorldOptions = {}) {
    this.options = options;
    this.world = new World();
  }

  public update(deltaTime: number): void {
    if (!this.isRunning) return;
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
  }

  public setGravity(gravity: Vector3 | THREE.Vector3): void {
    this.applyGravity(gravity);
  }

  private applyGravity(gravity: Vector3 | THREE.Vector3): void {
    this.world.gravity.set(gravity.x || 0, gravity.y || -9.82, gravity.z || 0);
  }

  public setFixedTimeStep(timeStep: number): void {
    this.fixedTimeStep = timeStep;
  }

  public getFixedTimeStep(): number {
    return this.fixedTimeStep;
  }

  public setMaxSubSteps(steps: number): void {
    this.maxSubSteps = steps;
  }

  public getMaxSubSteps(): number {
    return this.maxSubSteps;
  }

  public enableDebug(scene: THREE.Scene): void {
    console.log("Physics debug visualization enabled");

    // Create the debugger instance
    this.debugger = CannonDebugger(scene, this.world, {
      // Optional configuration
      color: 0x00ff00, // Default is red 0xff0000
      scale: 1, // Scale of the debug shapes
      onInit: (_body, mesh) => {
        // Optional callback when a body is initialized with a debug mesh
        mesh.visible = true; // All meshes are visible by default
      },
    });
  }

  public updateDebug(): void {
    if (this.debugger) {
      this.debugger.update();
    }
  }

  // Add proper type for body options
  public createBody(options: BodyOptions): Body {
    const body = new Body({
      ...options,
      material: options?.material || new Material(),
    });
    this.world.addBody(body);
    return body;
  }

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
    if (this.options.broadphase === "sap") {
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

  public stop(): void {
    this.isRunning = false;
  }

  public dispose(): void {
    this.stop();

    // Clean up physics bodies
    this.world.bodies.forEach((body) => this.world.removeBody(body));
    this.world.contacts = [];
    // Clear any remaining contact equations
    (this.world.narrowphase as any).contactEquations = [];

    // Clean up debugger
    this.debugger = null;
  }
}
