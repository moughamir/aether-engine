import * as THREE from 'three';
import { AetherApp } from '../AetherApp';
import { CameraManager } from './CameraManager';

export class SceneManager {
  private app: AetherApp;
  public scene: THREE.Scene;
  public cameraManager: CameraManager;
  
  constructor(app: AetherApp) {
    this.app = app;
    this.scene = new THREE.Scene();
    this.cameraManager = new CameraManager();
    
    // Add default lighting
    this.setupDefaultLighting();
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
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }
}