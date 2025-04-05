import React, { useEffect } from 'react';
import * as THREE from 'three';
import { AetherApp } from '@aether/core';
import { useAether } from '@aether/react';

interface GameSceneProps {
  app: AetherApp | null;
}

export const GameScene: React.FC<GameSceneProps> = ({ app }) => {
  const { app: contextApp } = useAether();
  const activeApp = app || contextApp;
  
  useEffect(() => {
    if (!activeApp) return;
    
    // Setup scene
    setupScene(activeApp);
    
    // Cleanup
    return () => {
      // Any cleanup code
    };
  }, [activeApp]);
  
  return null; // This component doesn't render anything directly
};

function setupScene(app: AetherApp) {
  // Set camera position
  app.sceneManager.cameraManager.perspectiveCamera.position.set(0, 5, 10);
  app.sceneManager.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
  
  // Add a grid helper
  const gridHelper = new THREE.GridHelper(20, 20);
  app.sceneManager.scene.add(gridHelper);
  
  // Create a ground plane
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  ground.receiveShadow = true;
  app.sceneManager.scene.add(ground);
  
  // Add a physics body for the ground
  if (app.physicsWorld) {
    const groundBody = app.physicsWorld.createBody({
      mass: 0, // Static body
      type: 2 // STATIC
    });
    
    // Add a plane shape
    const groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    
    // Rotate to match the visual ground
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  }
  
  // Create some boxes
  for (let i = 0; i < 5; i++) {
    createBox(app, {
      position: new THREE.Vector3(
        Math.random() * 10 - 5,
        Math.random() * 5 + 2,
        Math.random() * 10 - 5
      ),
      size: Math.random() * 0.5 + 0.5,
      color: Math.random() * 0xffffff
    });
  }
}

interface BoxOptions {
  position: THREE.Vector3;
  size: number;
  color: number;
}

function createBox(app: AetherApp, options: BoxOptions) {
  // Create visual box
  const geometry = new THREE.BoxGeometry(options.size, options.size, options.size);
  const material = new THREE.MeshStandardMaterial({ color: options.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(options.position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  app.sceneManager.scene.add(mesh);
  
  // Create physics body
  if (app.physicsWorld) {
    const boxBody = app.physicsWorld.createBody({
      mass: 1,
      position: new CANNON.Vec3(
        options.position.x,
        options.position.y,
        options.position.z
      )
    });
    
    // Add box shape
    const halfExtents = new CANNON.Vec3(
      options.size / 2,
      options.size / 2,
      options.size / 2
    );
    const boxShape = new CANNON.Box(halfExtents);
    boxBody.addShape(boxShape);
    
    // Sync mesh with body
    app.physicsWorld.world.addEventListener('postStep', () => {
      mesh.position.set(
        boxBody.position.x,
        boxBody.position.y,
        boxBody.position.z
      );
      
      mesh.quaternion.set(
        boxBody.quaternion.x,
        boxBody.quaternion.y,
        boxBody.quaternion.z,
        boxBody.quaternion.w
      );
    });
  }
  
  return { mesh };
}