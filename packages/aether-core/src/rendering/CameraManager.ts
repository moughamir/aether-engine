import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export type CameraType = 'perspective' | 'orthographic';

export interface CameraOptions {
  type?: CameraType;
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: THREE.Vector3;
  lookAt?: THREE.Vector3;
  enableControls?: boolean;
}

export class CameraManager {
  public activeCamera: THREE.Camera;
  public perspectiveCamera: THREE.PerspectiveCamera;
  public orthographicCamera: THREE.OrthographicCamera;
  public controls: OrbitControls | null = null;

  constructor(options: CameraOptions = {}) {
    // Create perspective camera
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      options.fov || 75,
      options.aspect || window.innerWidth / window.innerHeight,
      options.near || 0.1,
      options.far || 1000
    );

    // Create orthographic camera
    const aspect = options.aspect || window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    this.orthographicCamera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      options.near || 0.1,
      options.far || 1000
    );

    // Set active camera based on options
    this.activeCamera = options.type === 'orthographic'
      ? this.orthographicCamera
      : this.perspectiveCamera;

    // Set initial position
    if (options.position) {
      this.activeCamera.position.copy(options.position);
    } else {
      this.activeCamera.position.set(0, 5, 10);
    }

    // Look at target
    if (options.lookAt) {
      this.activeCamera.lookAt(options.lookAt);
    } else {
      this.activeCamera.lookAt(0, 0, 0);
    }

    // Setup controls if enabled
    if (options.enableControls) {
      this.setupControls();
    }
  }

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
  public setActiveCamera(camera: THREE.Camera | CameraType): void {
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

  public update(): void {
    if (this.controls) {
      this.controls.update();
    }
  }
}
