import * as THREE from "three";
import { CameraManager } from "./cameraManager";
import { Lifecycle } from "@aether/shared";

import type { SceneOptions, FogOptions, CameraOptions } from "./types";
import AetherApp from "./aetherApp";

export class SceneManager implements Lifecycle {
  app: AetherApp;
  public scene: THREE.Scene;
  public cameraManager: CameraManager;
  private isRunning: boolean = false;

  constructor(app: AetherApp) {
    this.app = app;
    this.scene = new THREE.Scene();
    this.cameraManager = new CameraManager();

    // Add default lighting
    this.setupDefaultLighting();
  }

  public initialize(options?: SceneOptions): void {
    // Configure the scene with the provided options
    this.configureScene(options);
  }

  public configureScene(options?: SceneOptions): void {
    if (!options) return;

    // Set background if provided
    if (options.background) {
      if (
        typeof options.background === "string" ||
        typeof options.background === "number"
      ) {
        this.setBackgroundColor(options.background);
      } else {
        this.setBackground(options.background);
      }
    }

    // Set fog if enabled
    if (options.fog && options.fog.enabled) {
      this.setFog(options.fog);
    }
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public setBackgroundColor(color: string | number): void {
    this.scene.background = new THREE.Color(color);
  }

  public setBackground(background: THREE.Color | THREE.Texture): void {
    this.scene.background = background;
  }

  public setFog(options: FogOptions): void {
    const color =
      options.color !== undefined
        ? new THREE.Color(options.color)
        : new THREE.Color(0xcccccc);

    if (options.density !== undefined) {
      // Create exponential fog if density is provided
      this.scene.fog = new THREE.FogExp2(color, options.density);
    } else if (options.near !== undefined && options.far !== undefined) {
      // Create linear fog if near and far are provided
      this.scene.fog = new THREE.Fog(color, options.near, options.far);
    }
  }

  public setupCamera(options: CameraOptions): void {
    const aspect = window.innerWidth / window.innerHeight;
    let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

    if (options.type === "orthographic") {
      camera = this.createOrthographicCamera(options);
    } else {
      camera = this.createPerspectiveCamera(options, aspect);
    }

    this.setupCameraPosition(camera, options);

    // Set as active camera
    this.cameraManager.setActiveCamera(camera);
  }

  private createPerspectiveCamera(
    options: CameraOptions,
    aspect: number
  ): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(
      options.fov || 75,
      aspect,
      options.near || 0.1,
      options.far || 1000
    );
  }

  private createOrthographicCamera(
    options: CameraOptions
  ): THREE.OrthographicCamera {
    return new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      options.near || 0.1,
      options.far || 1000
    );
  }

  private setupCameraPosition(
    camera: THREE.Camera,
    options: CameraOptions
  ): void {
    // Set camera position if provided
    if (options.position) {
      camera.position.set(
        options.position.x || 0,
        options.position.y || 0,
        options.position.z || 0
      );
    }

    // Set camera lookAt if provided
    if (options.lookAt) {
      camera.lookAt(
        new THREE.Vector3(
          options.lookAt.x || 0,
          options.lookAt.y || 0,
          options.lookAt.z || 0
        )
      );
    }
  }

  private setupDefaultLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);
  }

  public render(renderer: THREE.WebGLRenderer): void {
    if (!this.isRunning) return;

    renderer.render(this.scene, this.cameraManager.activeCamera);
  }

  public updateCameraAspect(aspect: number): void {
    this.cameraManager.updateAspect(aspect);
  }

  public async start(): Promise<void> {
    if (this.isRunning) return Promise.resolve();

    // Start the camera manager
    await this.cameraManager.start();

    this.isRunning = true;
    return Promise.resolve();
  }

  public stop(): void {
    if (!this.isRunning) return;

    // Stop the camera manager
    this.cameraManager.stop();

    this.isRunning = false;
  }

  public dispose(): void {
    // Stop the scene manager if it's running
    if (this.isRunning) {
      this.stop();
    }

    // Dispose of all scene objects
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });

    // Dispose of the camera manager
    this.cameraManager.dispose();
  }
}
