import * as THREE from 'three';
import { SceneManager } from './rendering/SceneManager';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { NetworkManager } from './network/NetworkManager';
import { EntityManager } from './entity/EntityManager';
import { AssetLoader } from './assets/AssetLoader';
import EventEmitter from 'eventemitter3';
import { AetherAppOptions } from '.';



export class AetherApp extends EventEmitter {
  private renderer: THREE.WebGLRenderer;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  public sceneManager: SceneManager;
  public physicsWorld?: PhysicsWorld;
  public networkManager?: NetworkManager;
  public entityManager: EntityManager;
  public assetLoader: AssetLoader;

  constructor(options: AetherAppOptions = {}) {
    super();

    // Create renderer
    const canvas = options.canvas || document.createElement('canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: options.renderer?.antialias ?? true,
      alpha: options.renderer?.alpha ?? false,
      preserveDrawingBuffer: options.renderer?.preserveDrawingBuffer ?? false,
      powerPreference: options.renderer?.powerPreference ?? 'default'
    });

    // Configure renderer
    this.renderer.setSize(options.width || window.innerWidth, options.height || window.innerHeight);
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
        if (typeof options.scene.background === 'string' || typeof options.scene.background === 'number') {
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
          far: options.scene.fog.far
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
      if (typeof options.physics === 'object') {
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
      if (typeof options.networking === 'object') {
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
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.stop();
          } else {
            this.start();
          }
        });
      }
    }

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.update.bind(this));
      this.emit('start');
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.emit('stop');
  }

  private update(time: number): void {
    if (!this.isRunning) return;

    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Update physics
    if (this.physicsWorld) {
      this.physicsWorld.update(deltaTime);

      // Update physics debug visualization if enabled
      this.physicsWorld.updateDebug();
    }

    // Update entities
    this.entityManager.update(deltaTime);

    // Render scene
    this.sceneManager.render(this.renderer);

    // Continue loop
    requestAnimationFrame(this.update.bind(this));
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
    this.sceneManager.updateCameraAspect(width / height);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.stop();
    this.renderer.dispose();
    this.sceneManager.dispose();
    if (this.physicsWorld) this.physicsWorld.dispose();
    if (this.networkManager) this.networkManager.disconnect();
  }
}
