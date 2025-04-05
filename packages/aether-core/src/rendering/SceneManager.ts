import * as THREE from "three";
import { AetherApp } from "../AetherApp";
import { CameraManager } from "./CameraManager";

interface FogOptions {
  color?: string | number;
  density?: number;
  near?: number;
  far?: number;
}

interface CameraOptions {
  type?: "perspective" | "orthographic";
  fov?: number;
  near?: number;
  far?: number;
  position?: { x: number; y: number; z: number };
  lookAt?: { x: number; y: number; z: number };
}

export class SceneManager {
  app: AetherApp;
  public scene: THREE.Scene;
  public cameraManager: CameraManager;

  constructor(app: AetherApp) {
    this.app = app;
    this.scene = new THREE.Scene();
    this.cameraManager = new CameraManager();

    // Add default lighting
    this.setupDefaultLighting();
  }

  /**
   * Get the current scene
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Set the background color of the scene
   */
  public setBackgroundColor(color: string | number): void {
    this.scene.background = new THREE.Color(color);
  }

  /**
   * Set the background of the scene (can be a texture or color)
   */
  public setBackground(background: THREE.Color | THREE.Texture): void {
    this.scene.background = background;
  }

  /**
   * Set the fog in the scene
   */
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

  /**
   * Setup camera based on provided options
   */
  public setupCamera(options: CameraOptions): void {
    const aspect = window.innerWidth / window.innerHeight;
    let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

    if (options.type === "orthographic") {
      // Create orthographic camera
      camera = new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1,
        options.near || 0.1,
        options.far || 1000
      );
    } else {
      // Create perspective camera (default)
      camera = new THREE.PerspectiveCamera(
        options.fov || 75,
        aspect,
        options.near || 0.1,
        options.far || 1000
      );
    }

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

    // Set as active camera
    this.cameraManager.setActiveCamera(camera);
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
    renderer.render(this.scene, this.cameraManager.activeCamera);
  }

  public updateCameraAspect(aspect: number): void {
    this.cameraManager.updateAspect(aspect);
  }

  public dispose(): void {
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
  }
}
