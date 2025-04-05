import React, { useState } from 'react';
import { useAether } from '@aether/react';
import './UI.css';

export const UI: React.FC = () => {
  const { app } = useAether();
  const [showDebug, setShowDebug] = useState(false);
  
  const handleAddBox = () => {
    if (!app) return;
    
    // Create a random box
    const position = new THREE.Vector3(
      Math.random() * 10 - 5,
      Math.random() * 5 + 2,
      Math.random() * 10 - 5
    );
    
    const size = Math.random() * 0.5 + 0.5;
    const color = Math.random() * 0xffffff;
    
    // Use the createBox function from GameScene
    // In a real app, you might want to refactor this to be more accessible
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    app.sceneManager.scene.add(mesh);
    
    // Create physics body
    if (app.physicsWorld) {
      const boxBody = app.physicsWorld.createBody({
        mass: 1,
        position: new CANNON.Vec3(
          position.x,
          position.y,
          position.z
        )
      });
      
      // Add box shape
      const halfExtents = new CANNON.Vec3(
        size / 2,
        size / 2,
        size / 2
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
  };
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };
  
  return (
    <div className="ui-container">
      <div className="ui-panel">
        <h2>Aether Demo</h2>
        <button onClick={handleAddBox}>Add Box</button>
        <button onClick={toggleDebug}>Toggle Debug</button>
        
        {showDebug && (
          <div className="debug-panel">
            <h3>Debug Info</h3>
            <p>FPS: {app ? Math.round(1000 / (performance.now() - (app as any).lastTime)) : 0}</p>
            <p>Entities: {app?.entityManager.getAll().length || 0}</p>
            <p>Physics Bodies: {app?.physicsWorld?.bodies.length || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
};