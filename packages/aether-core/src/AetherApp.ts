import * as THREE from "three";
import { SceneManager } from "./rendering/SceneManager";
import { PhysicsWorld } from "./physics/PhysicsWorld";
import { NetworkManager } from "./network/NetworkManager";
import { EntityManager } from "./entity/EntityManager";
import { AssetLoader } from "./assets/AssetLoader";
import EventEmitter from "eventemitter3";
import { AetherAppOptions } from "./contracts";
import { Lifecycle, debounce, ErrorType, createError } from "@aether/shared";

export class AetherApp extends EventEmitter implements Lifecycle {
  private renderer: THREE.WebGLRenderer;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private accumulatedTime: number = 0;
  private debouncedResize: (width: number, height: number) => void;
  private targetFPS?: number;
  private fpsInterval?: number;

  public sceneManager: SceneManager;
  public physicsWorld?: PhysicsWorld;
  public networkManager?: NetworkManager;
  public entityManager: EntityManager;
  public assetLoader: AssetLoader;
  public stats: {
    fps: number;
    frameTime: number;
    physicsTime: number;
  } = { fps: 0, frameTime: 0, physicsTime: 0 };

  constructor(options: AetherAppOptions = {}) {
    super();

    try {
      // Create renderer
      const canvas = options.canvas || document.createElement("canvas");
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: options.renderer?.antialias ?? true,
        alpha: options.renderer?.alpha ?? false,
        preserveDrawingBuffer: options.renderer?.preserveDrawingBuffer ?? false,
        powerPreference: options.renderer?.powerPreference ?? "default",
      });

    // Configure renderer
    this.renderer.setSize(
      options.width || window.innerWidth,
      options.height || window.innerHeight
    );
    this.renderer.setPixelRatio(options.pixelRatio || window.devicePixelRatio);

    // Configure shadow maps if enabled
    if (options.renderer?.shadowMap?.enabled) {
      this.renderer.shadowMap.enabled = true;
      if (options.renderer.shadowMap.type !== undefined) {
        this.renderer.shadowMap.type = options.renderer.shadowMap.type;
      }
    }

    // Create managers
    this.sceneManager = new SceneManager(this);

    // Configure scene if options provided
    if (options.scene) {
      if (options.scene.background !== undefined) {
        // Handle different background types
        if (
          typeof options.scene.background === "string" ||
          typeof options.scene.background === "number"
        ) {
          this.sceneManager.setBackgroundColor(options.scene.background);
        } else {
          this.sceneManager.setBackground(options.scene.background);
        }
      }

      // Configure fog if enabled
      if (options.scene.fog?.enabled) {
        this.sceneManager.setFog({
          color: options.scene.fog.color,
          density: options.scene.fog.density,
          near: options.scene.fog.near,
          far: options.scene.fog.far,
        });
      }
    }

    // Configure camera if options provided
    if (options.camera) {
      this.sceneManager.setupCamera(options.camera);
    }

    this.entityManager = new EntityManager();

    // Configure asset loader
    this.assetLoader = new AssetLoader();
    if (options.assets) {
      if (options.assets.baseUrl) {
        this.assetLoader.setBaseUrl(options.assets.baseUrl);
      }

      if (options.assets.preload && options.assets.preload.length > 0) {
        this.assetLoader.preload(options.assets.preload);
      }
    }

    // Optional systems
    if (options.physics) {
      this.physicsWorld = new PhysicsWorld();

      // Configure physics if detailed options provided
      if (typeof options.physics === "object") {
        if (options.physics.gravity) {
          this.physicsWorld.setGravity(options.physics.gravity);
        }

        if (options.physics.debug) {
          this.physicsWorld.enableDebug(this.sceneManager.getScene());
        }
      }
    }

    if (options.networking) {
      this.networkManager = new NetworkManager();

      // Configure networking if detailed options provided
      if (typeof options.networking === "object") {
        if (options.networking.serverUrl) {
          this.networkManager.setServerUrl(options.networking.serverUrl);
        }

        if (options.networking.autoConnect) {
          this.networkManager.connect();
        }
      }
    }

    // Configure performance options
    if (options.performance) {
      if (options.performance.throttleWhenHidden) {
        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            this.stop();
          } else {
            this.start();
          }
        });
      }

      if (options.performance.targetFPS) {
        this.targetFPS = options.performance.targetFPS;
        this.fpsInterval = 1000 / this.targetFPS;
      }

      // Set fixed time step based on target FPS if provided
      if (this.targetFPS) {
      }
    }

    // Create debounced resize handler
    this.debouncedResize = debounce(this.handleResize.bind(this), 250);

    // Handle window resize
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.debouncedResize(width, height);
    });

    } catch (error) {
      throw createError(
        ErrorType.INITIALIZATION,
        `Failed to initialize AetherApp: ${error instanceof Error ? error.message : String(error)}`,
        { options }
      );
    }
  }

  public async start(): Promise<void> {
    if (!this.isRunning) {
      try {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.accumulatedTime = 0;
        requestAnimationFrame(this.update.bind(this));
        this.emit("start");
      } catch (error) {
        const errorMessage = `Failed to start AetherApp: ${error instanceof Error ? error.message : String(error)}`;
        this.emit("error", createError(ErrorType.RUNTIME, errorMessage));
        throw createError(ErrorType.RUNTIME, errorMessage);
      }
    }
    return Promise.resolve();
  }

  public stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.emit("stop");
    }
  }

  private update(time: number): void {
    if (!this.isRunning) return;

    // Calculate frame time and FPS
    const frameStartTime = performance.now();
    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Throttle to target FPS if specified
    if (this.targetFPS && this.fpsInterval) {
      const elapsed = frameStartTime - this.lastTime;
      if (elapsed < this.fpsInterval) {
        requestAnimationFrame(this.update.bind(this));
        return;
      }
    }

    try {
      // Accumulate time for fixed time step physics
      this.accumulatedTime += deltaTime;

      // Update physics with fixed time step
      if (this.physicsWorld) {
        const physicsStartTime = performance.now();

        // Use the physics world's internal fixed time step
        this.physicsWorld.update(deltaTime);

        // Update physics debug visualization if enabled
        this.physicsWorld.updateDebug();

        this.stats.physicsTime = performance.now() - physicsStartTime;
      }

      // Update entities
      this.entityManager.update(deltaTime);

      // Render scene
      this.sceneManager.render(this.renderer);

      // Update performance stats
      this.stats.frameTime = performance.now() - frameStartTime;
      this.stats.fps = 1000 / this.stats.frameTime;

      // Continue loop
      requestAnimationFrame(this.update.bind(this));
    } catch (error) {
      this.isRunning = false;
      const errorMessage = `Error in update loop: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      this.emit("error", createError(ErrorType.RUNTIME, errorMessage));
    }
  }

  private handleResize(width: number, height: number): void {
    try {
      this.renderer.setSize(width, height);
      this.sceneManager.updateCameraAspect(width / height);
      this.emit("resize", { width, height });
    } catch (error) {
      const errorMessage = `Error handling resize: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      this.emit("error", createError(ErrorType.RUNTIME, errorMessage));
    }
  }

  public dispose(): void {
    try {
      // Remove event listeners
      window.removeEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.debouncedResize(width, height);
      });
      document.removeEventListener("visibilitychange", this.stop.bind(this));

      // Stop the game loop
      this.stop();

      // Dispose of all managers and systems
      this.renderer.dispose();
      this.sceneManager.dispose();
      this.entityManager.clear();
      // Clear asset loader cache if needed

      if (this.physicsWorld) this.physicsWorld.dispose();
      if (this.networkManager) this.networkManager.disconnect();

      // Clear all event listeners
      this.removeAllListeners();

      this.emit("disposed");
    } catch (error) {
      const errorMessage = `Error disposing AetherApp: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
    }
  }

  /**
   * Gets the current performance statistics
   * @returns Object containing FPS, frame time, and physics time
   */
  public getStats() {
    return { ...this.stats };
  }

  /**
   * Sets the target FPS for the application
   * @param fps Target frames per second
   */
  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.fpsInterval = 1000 / fps;
  }
}
