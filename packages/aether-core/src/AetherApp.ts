import * as THREE from 'three';
import { SceneManager } from './rendering/SceneManager';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { NetworkManager } from './network/NetworkManager';
import { EntityManager } from './entity/EntityManager';
import { AssetLoader } from './assets/AssetLoader';
import EventEmitter from 'eventemitter3';

export interface AetherAppOptions {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  pixelRatio?: number;
  physics?: boolean;
  networking?: boolean;
}

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
      antialias: true 
    });
    
    // Configure renderer
    this.renderer.setSize(options.width || window.innerWidth, options.height || window.innerHeight);
    this.renderer.setPixelRatio(options.pixelRatio || window.devicePixelRatio);
    
    // Create managers
    this.sceneManager = new SceneManager(this);
    this.entityManager = new EntityManager(this);
    this.assetLoader = new AssetLoader();
    
    // Optional systems
    if (options.physics) {
      this.physicsWorld = new PhysicsWorld();
    }
    
    if (options.networking) {
      this.networkManager = new NetworkManager();
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