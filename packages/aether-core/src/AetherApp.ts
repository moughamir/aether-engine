import * as THREE from "three";
import { SceneManager } from "./managers/rendering/SceneManager";
import { PhysicsWorld } from "./systems/physics/PhysicsWorld";
import { EntityManager } from "./managers/entity/EntityManager";
import { AssetLoader } from "./managers/assets/AssetLoader";
import EventEmitter from "eventemitter3";
import { AetherAppOptions } from "./contracts";
import { Lifecycle, debounce, ErrorType, createError } from "@aether/shared";
import { NetworkManager } from "./systems/network/NetworkManager";
import { initResourcePool } from "./utils/initResourcePool";

export class AetherApp extends EventEmitter implements Lifecycle {
  private renderer!: THREE.WebGLRenderer;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private accumulatedTime: number = 0;
  private debouncedResize!: (width: number, height: number) => void;
  private targetFPS?: number;
  private fpsInterval?: number;
  private options: AetherAppOptions;

  public sceneManager!: SceneManager;
  public physicsWorld?: PhysicsWorld;
  public networkManager?: NetworkManager;
  public entityManager!: EntityManager;
  public assetLoader!: AssetLoader;
  public stats: {
    fps: number;
    frameTime: number;
    physicsTime: number;
  } = { fps: 0, frameTime: 0, physicsTime: 0 };

  constructor(options: AetherAppOptions = {}) {
    super();
    this.options = options;

    // Initialize resource pools
    initResourcePool();

    try {
      // Initialize core components
      this.initializeRenderer();
      this.initializeManagers();
      this.setupOptionalSystems();
      this.configurePerformance();
      this.setupEventListeners();
    } catch (error) {
      throw createError(
        ErrorType.INITIALIZATION,
        `Failed to initialize AetherApp: ${error instanceof Error ? error.message : String(error)}`,
        { options }
      );
    }
  }

  /**
   * Initializes the WebGL renderer with the provided options
   */
  private initializeRenderer(): void {
    // Create renderer
    const canvas = this.options.canvas || document.createElement("canvas");
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.options.renderer?.antialias ?? true,
      alpha: this.options.renderer?.alpha ?? false,
      preserveDrawingBuffer: this.options.renderer?.preserveDrawingBuffer ?? false,
      powerPreference: this.options.renderer?.powerPreference ?? "default",
    });

    // Configure renderer size and pixel ratio
    this.renderer.setSize(
      this.options.width || window.innerWidth,
      this.options.height || window.innerHeight
    );
    this.renderer.setPixelRatio(
      this.options.pixelRatio || window.devicePixelRatio
    );

    // Configure shadow maps if enabled
    if (this.options.renderer?.shadowMap?.enabled) {
      this.renderer.shadowMap.enabled = true;
      if (this.options.renderer.shadowMap.type !== undefined) {
        this.renderer.shadowMap.type = this.options.renderer.shadowMap.type;
      }
    }
  }

  /**
   * Initializes and configures the core managers (scene, entity, asset)
   */
  private initializeManagers(): void {
    // Create scene manager
    this.sceneManager = new SceneManager(this);
    this.configureScene();

    // Create entity manager
    this.entityManager = new EntityManager();

    // Create and configure asset loader
    this.assetLoader = new AssetLoader();
    this.configureAssetLoader();
  }

  /**
   * Configures the scene with the provided options
   */
  private configureScene(): void {
    if (!this.options.scene) return;

    // Configure background if provided
    if (this.options.scene.background !== undefined) {
      if (
        typeof this.options.scene.background === "string" ||
        typeof this.options.scene.background === "number"
      ) {
        this.sceneManager.setBackgroundColor(this.options.scene.background);
      } else {
        this.sceneManager.setBackground(this.options.scene.background);
      }
    }

    // Configure fog if enabled
    if (this.options.scene.fog?.enabled) {
      this.sceneManager.setFog({
        color: this.options.scene.fog.color,
        density: this.options.scene.fog.density,
        near: this.options.scene.fog.near,
        far: this.options.scene.fog.far,
      });
    }

    // Configure camera if options provided
    if (this.options.camera) {
      this.sceneManager.setupCamera(this.options.camera);
    }
  }

  /**
   * Configures the asset loader with the provided options
   */
  private configureAssetLoader(): void {
    if (!this.options.assets) return;

    if (this.options.assets.baseUrl) {
      this.assetLoader.setBaseUrl(this.options.assets.baseUrl);
    }

    if (this.options.assets.preload && this.options.assets.preload.length > 0) {
      this.assetLoader.preload(this.options.assets.preload);
    }
  }

  /**
   * Sets up optional systems like physics and networking
   */
  private setupOptionalSystems(): void {
    this.setupPhysics();
    this.setupNetworking();
  }

  /**
   * Sets up the physics system if enabled in options
   */
  private setupPhysics(): void {
    if (!this.options.physics) return;

    this.physicsWorld = new PhysicsWorld();

    // Configure physics if detailed options provided
    if (typeof this.options.physics === "object") {
      if (this.options.physics.gravity) {
        this.physicsWorld.setGravity(this.options.physics.gravity);
      }

      if (this.options.physics.debug) {
        this.physicsWorld.enableDebug(this.sceneManager.getScene());
      }
    }
  }

  /**
   * Sets up the networking system if enabled in options
   */
  private setupNetworking(): void {
    if (!this.options.networking) return;

    this.networkManager = new NetworkManager();

    // Configure networking if detailed options provided
    if (typeof this.options.networking === "object") {
      if (this.options.networking.serverUrl) {
        this.networkManager.setServerUrl(this.options.networking.serverUrl);
      }

      if (this.options.networking.autoConnect) {
        this.networkManager.connect();
      }
    }
  }

  /**
   * Configures performance-related options
   */
  private configurePerformance(): void {
    if (!this.options.performance) return;

    if (this.options.performance.targetFPS) {
      this.targetFPS = this.options.performance.targetFPS;
      this.fpsInterval = 1000 / this.targetFPS;
    }
  }

  /**
   * Sets up event listeners for window events
   */
  private setupEventListeners(): void {
    // Set up visibility change listener if throttling is enabled
    if (this.options.performance?.throttleWhenHidden) {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });
    }

    // Create debounced resize handler
    this.debouncedResize = debounce(this.handleResize.bind(this), 250);

    // Handle window resize
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.debouncedResize(width, height);
    });
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
    if (this.shouldThrottleFrame(frameStartTime)) {
      requestAnimationFrame(this.update.bind(this));
      return;
    }

    try {
      // Accumulate time for fixed time step physics
      this.accumulatedTime += deltaTime;

      // Update systems
      this.updatePhysics(deltaTime);
      this.updateEntities(deltaTime);
      this.renderScene();

      // Update performance stats
      this.updatePerformanceStats(frameStartTime);

      // Continue loop
      requestAnimationFrame(this.update.bind(this));
    } catch (error) {
      this.isRunning = false;
      const errorMessage = `Error in update loop: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      this.emit("error", createError(ErrorType.RUNTIME, errorMessage));
    }
  }

  /**
   * Determines if the current frame should be throttled based on target FPS
   * @param frameStartTime Current frame start timestamp
   * @returns True if the frame should be throttled
   */
  private shouldThrottleFrame(frameStartTime: number): boolean {
    if (this.targetFPS && this.fpsInterval) {
      const elapsed = frameStartTime - this.lastTime;
      return elapsed < this.fpsInterval;
    }
    return false;
  }

  /**
   * Updates the physics simulation
   * @param deltaTime Time since last update in seconds
   */
  private updatePhysics(deltaTime: number): void {
    if (!this.physicsWorld) return;

    const physicsStartTime = performance.now();

    // Use the physics world's internal fixed time step
    this.physicsWorld.update(deltaTime);

    // Update physics debug visualization if enabled
    this.physicsWorld.updateDebug();

    this.stats.physicsTime = performance.now() - physicsStartTime;
  }

  /**
   * Updates all entities in the entity manager
   * @param deltaTime Time since last update in seconds
   */
  private updateEntities(deltaTime: number): void {
    this.entityManager.update(deltaTime);
  }

  /**
   * Renders the current scene
   */
  private renderScene(): void {
    this.sceneManager.render(this.renderer);
  }

  /**
   * Updates performance statistics
   * @param frameStartTime Start time of the current frame
   */
  private updatePerformanceStats(frameStartTime: number): void {
    this.stats.frameTime = performance.now() - frameStartTime;
    this.stats.fps = 1000 / this.stats.frameTime;
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
      // Clean up in a specific order to avoid dependency issues
      this.removeEventListeners();
      this.stop();
      this.disposeManagers();
      this.disposeOptionalSystems();

      // Clear all event listeners
      this.removeAllListeners();

      this.emit("disposed");
    } catch (error) {
      const errorMessage = `Error disposing AetherApp: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
    }
  }

  /**
   * Removes all event listeners added by the application
   */
  private removeEventListeners(): void {
    window.removeEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.debouncedResize(width, height);
    });

    if (this.options.performance?.throttleWhenHidden) {
      document.removeEventListener("visibilitychange", this.stop.bind(this));
    }
  }

  /**
   * Disposes of all core managers
   */
  private disposeManagers(): void {
    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Dispose of scene manager
    if (this.sceneManager) {
      this.sceneManager.dispose();
    }

    // Clear entity manager
    if (this.entityManager) {
      this.entityManager.clear();
    }

    // Clear asset loader cache if needed
    // this.assetLoader.clearCache();
  }

  /**
   * Disposes of optional systems like physics and networking
   */
  private disposeOptionalSystems(): void {
    // Dispose of physics world if it exists
    if (this.physicsWorld) {
      this.physicsWorld.dispose();
    }

    // Disconnect network manager if it exists
    if (this.networkManager) {
      this.networkManager.disconnect();
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
