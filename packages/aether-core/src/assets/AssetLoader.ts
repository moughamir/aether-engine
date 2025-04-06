import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import EventEmitter from 'eventemitter3';
import { AssetType, LoadingStrategy } from '../contracts';


export interface AssetLoaderOptions {
  baseUrl?: string;
  preload?: string[];
  loadingStrategy?: LoadingStrategy;
  cacheAssets?: boolean;
  maxRetries?: number;
  dracoDecoderPath?: string;
  onProgress?: (progress: number, url: string, loaded: number, total: number) => void;
}

export interface AssetCache {
  textures: Map<string, THREE.Texture>;
  models: Map<string, THREE.Group>;
  audio: Map<string, AudioBuffer>;
}

interface LoaderWithLoad<T> {
  load(url: string, onLoad: (result: T) => void, onProgress?: (event: ProgressEvent) => void, onError?: (error: ErrorEvent) => void): void;
}
export class AssetLoader extends EventEmitter {
  private textureLoader: THREE.TextureLoader;
  private gltfLoader: GLTFLoader;
  private audioLoader: THREE.AudioLoader;
  private loadingManager: THREE.LoadingManager;
  private baseUrl: string = '';
  private loadingStrategy: LoadingStrategy = 'eager';
  private cacheAssets: boolean = true;
  private maxRetries: number = 3;
  private cache: AssetCache = {
    textures: new Map<string, THREE.Texture>(),
    models: new Map<string, THREE.Group>(),
    audio: new Map<string, AudioBuffer>()
  }

  constructor(options?: AssetLoaderOptions) {
    super();
    this.loadingManager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.audioLoader = new THREE.AudioLoader(this.loadingManager);

    // Setup GLTF loader with Draco compression support
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    const dracoLoader = new DRACOLoader();
    const dracoDecoderPath = options?.dracoDecoderPath || 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/';
    dracoLoader.setDecoderPath(dracoDecoderPath);
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Apply options if provided
    if (options) {
      if (options.baseUrl) this.setBaseUrl(options.baseUrl);
      if (options.loadingStrategy) this.loadingStrategy = options.loadingStrategy;
      if (options.cacheAssets !== undefined) this.cacheAssets = options.cacheAssets;
      if (options.maxRetries !== undefined) this.maxRetries = options.maxRetries;
      if (options.preload) this.preload(options.preload);
    }

    // Setup loading events
    this.loadingManager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      console.log(`Loading: ${progress.toFixed(2)}% (${url})`);

      // Emit progress event
      this.emit('progress', progress, url, loaded, total);

      // Call custom progress callback if provided
      if (options?.onProgress) {
        options.onProgress(progress, url, loaded, total);
      }
    };

    this.loadingManager.onLoad = () => {
      this.emit('complete');
    };

    this.loadingManager.onError = (url) => {
      this.emit('error', url);
    };
  }

  /**
   * Load assets one by one in sequence
   * @param paths Array of asset paths to load
   * @param onAssetLoaded Callback to call when an asset is loaded
   */
  private async loadAssetsProgressively(paths: string[], onAssetLoaded: () => void): Promise<void> {
    for (const path of paths) {
      const fullUrl = this.getFullUrl(path);

      try {
        // Determine asset type from extension
        if (fullUrl.endsWith('.jpg') || fullUrl.endsWith('.png') || fullUrl.endsWith('.webp')) {
          await this.loadTexture(path);
        } else if (fullUrl.endsWith('.gltf') || fullUrl.endsWith('.glb')) {
          await this.loadModel(path);
        } else if (fullUrl.endsWith('.mp3') || fullUrl.endsWith('.wav') || fullUrl.endsWith('.ogg')) {
          await this.loadAudio(path);
        } else {
          console.warn(`Unknown asset type for ${fullUrl}`);
        }
      } catch (error) {
        console.error(`Failed to load asset: ${fullUrl}`, error);
      }

      onAssetLoaded();
    }
  }

  /**
   * Set the loading strategy for assets
   * @param strategy The loading strategy to use
   */
  public setLoadingStrategy(strategy: LoadingStrategy): void {
    this.loadingStrategy = strategy;
  }

  /**
   * Enable or disable asset caching
   * @param enabled Whether to enable asset caching
   */
  public setCacheEnabled(enabled: boolean): void {
    this.cacheAssets = enabled;
  }

  /**
   * Clear the asset cache
   * @param type Optional asset type to clear, or all types if not specified
   */
  public clearCache(type?: AssetType): void {
    if (!type) {
      // Clear all caches
      this.cache.textures.clear();
      this.cache.models.clear();
      this.cache.audio.clear();
      return;
    }

    // Clear specific cache
    switch (type) {
      case 'texture':
        this.cache.textures.clear();
        break;
      case 'model':
        this.cache.models.clear();
        break;
      case 'audio':
        this.cache.audio.clear();
        break;
    }
  }

  /**
   * Set the maximum number of retries for loading assets
   * @param retries The maximum number of retries
   */
  public setMaxRetries(retries: number): void {
    this.maxRetries = retries;
  }

  public loadTexture(url: string): Promise<THREE.Texture> {
    const fullUrl = this.getFullUrl(url);

    // Check cache first if caching is enabled
    if (this.cacheAssets && this.cache.textures.has(fullUrl)) {
      return Promise.resolve(this.cache.textures.get(fullUrl)!);
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        fullUrl,
        texture => {
          // Cache the texture if caching is enabled
          if (this.cacheAssets) {
            this.cache.textures.set(fullUrl, texture);
          }
          resolve(texture);
          this.emit('asset-loaded', 'texture', fullUrl);
        },
        undefined,
        error => reject(error)
      );
    });
  }

  public loadModel(url: string): Promise<THREE.Group> {
    const fullUrl = this.getFullUrl(url);

    // Check cache first if caching is enabled
    if (this.cacheAssets && this.cache.models.has(fullUrl)) {
      return Promise.resolve(this.cache.models.get(fullUrl)!);
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        fullUrl,
        gltf => {
          // Cache the model if caching is enabled
          if (this.cacheAssets) {
            this.cache.models.set(fullUrl, gltf.scene);
          }
          resolve(gltf.scene);
          this.emit('asset-loaded', 'model', fullUrl);
        },
        undefined,
        error => reject(error)
      );
    });
  }

  public loadAudio(url: string): Promise<AudioBuffer> {
    const fullUrl = this.getFullUrl(url);

    // Check cache first if caching is enabled
    if (this.cacheAssets && this.cache.audio.has(fullUrl)) {
      return Promise.resolve(this.cache.audio.get(fullUrl)!);
    }

    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        fullUrl,
        buffer => {
          // Cache the audio if caching is enabled
          if (this.cacheAssets) {
            this.cache.audio.set(fullUrl, buffer);
          }
          resolve(buffer);
          this.emit('asset-loaded', 'audio', fullUrl);
        },
        undefined,
        error => reject(error)
      );
    });
  }


  /**
   * Load an asset with automatic retry on failure
   * @param loader The loader to use
   * @param url The URL to load
   * @param retries The number of retries remaining
   * @returns A promise that resolves with the loaded asset
   */
  protected async loadWithRetry<T>(loader: LoaderWithLoad<T>, url: string, retries = this.maxRetries): Promise<T> {
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

  /**
   * Set the base URL for all asset loading
   * @param url Base URL for assets
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url.endsWith('/') ? url : `${url}/`;
  }

  /**
   * Get the full URL for an asset
   * @param path Asset path
   */
  private getFullUrl(path: string): string {
    // If the path is already a full URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }

    // Otherwise, prepend the base URL
    return `${this.baseUrl}${path}`;
  }

  /**
   * Preload a list of assets
   * @param paths Array of asset paths to preload
   */
  public preload(paths: string[]): Promise<void> {
    return new Promise((resolve) => {
      const total = paths.length;
      let loaded = 0;

      const onAssetLoaded = () => {
        loaded++;
        const progress = (loaded / total) * 100;
        this.emit('preload-progress', progress, loaded, total);

        if (loaded === total) {
          this.emit('preload-complete');
          resolve();
        }
      };

      // If no assets to load, resolve immediately
      if (total === 0) {
        this.emit('preload-complete');
        resolve();
        return;
      }

      this.emit('preload-start', paths);

      // Load assets based on loading strategy
      if (this.loadingStrategy === 'progressive') {
        // Load assets one by one in sequence
        this.loadAssetsProgressively(paths, onAssetLoaded);
      } else {
        // Start loading all assets in parallel (eager loading)
        paths.forEach(path => {
          const fullUrl = this.getFullUrl(path);

          // Determine asset type from extension
          if (fullUrl.endsWith('.jpg') || fullUrl.endsWith('.png') || fullUrl.endsWith('.webp')) {
            this.loadTexture(path).then(onAssetLoaded).catch(onAssetLoaded);
          } else if (fullUrl.endsWith('.gltf') || fullUrl.endsWith('.glb')) {
            this.loadModel(path).then(onAssetLoaded).catch(onAssetLoaded);
          } else if (fullUrl.endsWith('.mp3') || fullUrl.endsWith('.wav') || fullUrl.endsWith('.ogg')) {
            this.loadAudio(path).then(onAssetLoaded).catch(onAssetLoaded);
          } else {
            console.warn(`Unknown asset type for ${fullUrl}`);
            onAssetLoaded();
          }
        });
      }
    });
  }
}
