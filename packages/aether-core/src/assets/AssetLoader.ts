import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export class AssetLoader {
  private textureLoader: THREE.TextureLoader;
  private gltfLoader: GLTFLoader;
  private audioLoader: THREE.AudioLoader;
  private loadingManager: THREE.LoadingManager;
  
  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.audioLoader = new THREE.AudioLoader(this.loadingManager);
    
    // Setup GLTF loader with Draco compression support
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
    
    // Setup loading events
    this.loadingManager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      console.log(`Loading: ${progress.toFixed(2)}% (${url})`);
    };
  }
  
  public loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        texture => resolve(texture),
        undefined,
        error => reject(error)
      );
    });
  }
  
  public loadModel(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        gltf => resolve(gltf.scene),
        undefined,
        error => reject(error)
      );
    });
  }
  
  public loadAudio(url: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        buffer => resolve(buffer),
        undefined,
        error => reject(error)
      );
    });
  }
  
  private async loadWithRetry<T>(loader: THREE.Loader, url: string, retries = 3): Promise<T> {
    try {
      return await new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying load for ${url} (${retries} remaining)`);
        return this.loadWithRetry(loader, url, retries - 1);
      }
      throw new Error(`Failed to load ${url}: ${error}`);
    }
  }
}