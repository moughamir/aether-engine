import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CameraOptions, CameraViewType } from '../contracts';
import { Lifecycle } from '@aether/shared';

export class CameraManager implements Lifecycle {

  public activeCamera: THREE.Camera;
  public perspectiveCamera: THREE.PerspectiveCamera;
  public orthographicCamera: THREE.OrthographicCamera;
  public controls: OrbitControls | null = null;

  private options: CameraOptions;
  private isRunning: boolean = false;

  constructor(options: CameraOptions = {}) {
    this.options = options;

    // Create cameras
    this.perspectiveCamera = this.createPerspectiveCamera(options);
    this.orthographicCamera = this.createOrthographicCamera(options);

    // Set active camera based on options
    this.activeCamera = options.type === 'orthographic'
      ? this.orthographicCamera
      : this.perspectiveCamera;

    // Set initial position and orientation
    this.setupCameraPosition(this.activeCamera, options);
  }

  /**
   * Creates a perspective camera with the given options
   * @param options Camera configuration options
   * @returns Configured perspective camera
   */
  private createPerspectiveCamera(options: CameraOptions): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(
      options.fov || 75,
      options.aspect || window.innerWidth / window.innerHeight,
      options.near || 0.1,
      options.far || 1000
    );
  }

  /**
   * Creates an orthographic camera with the given options
   * @param options Camera configuration options
   * @returns Configured orthographic camera
   */
   private createOrthographicCamera(options: CameraOptions): THREE.OrthographicCamera {
    const aspect = options.aspect || window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    return new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      options.near || 0.1,
      options.far || 1000
    );
  }

  /**
   * Sets up the camera position and orientation
   * @param camera Camera to configure
   * @param options Camera configuration options
   */
  private setupCameraPosition(camera: THREE.Camera, options: CameraOptions): void {
    // Set initial position
    if (options.position) {
      camera.position.copy(options.position);
    } else {
      camera.position.set(0, 5, 10);
    }

    // Look at target
    if (options.lookAt) {
      camera.lookAt(options.lookAt);
    } else {
      camera.lookAt(0, 0, 0);
    }
  }

  /**
   * Sets up camera controls
   */
  private setupControls(): void {
    // We need a DOM element for controls, so we'll check if we're in a browser environment
    if (typeof document !== 'undefined') {
      this.controls = new OrbitControls(this.activeCamera, document.body);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
    }
  }

  /**
   * Set the active camera
   * @param camera Camera object or camera type string
   */
  public setActiveCamera(camera: THREE.Camera | CameraViewType): void {
    if (typeof camera === 'string') {
      // If a camera type string is provided
      this.activeCamera = camera === 'orthographic'
        ? this.orthographicCamera
        : this.perspectiveCamera;
    } else {
      // If a camera object is provided
      this.activeCamera = camera;
    }

    // Update controls to use the new active camera
    if (this.controls) {
      this.controls.object = this.activeCamera;
    }
  }

  public updateAspect(aspect: number): void {
    // Update perspective camera
    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    // Update orthographic camera
    const frustumSize = 10;
    this.orthographicCamera.left = frustumSize * aspect / -2;
    this.orthographicCamera.right = frustumSize * aspect / 2;
    this.orthographicCamera.updateProjectionMatrix();
  }

  /**
   * Updates the camera controls
   */
  public update(): void {
    if (!this.isRunning) return;

    if (this.controls) {
      this.controls.update();
    }
  }

  /**
   * Starts the camera system
   * Implements the Startable interface
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;

    // Setup controls if enabled
    if (this.options.enableControls) {
      this.setupControls();
    }

    this.isRunning = true;
    return Promise.resolve();
  }

  /**
   * Stops the camera system
   * Implements the Startable interface
   */
  public stop(): void {
    this.isRunning = false;
  }

  /**
   * Cleans up resources used by the camera system
   * Implements the Disposable interface
   */
  public dispose(): void {
    this.stop();

    // Dispose of controls
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
  }
}
