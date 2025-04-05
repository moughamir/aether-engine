import { useEffect, useRef } from 'react';
import { AetherApp } from '@aether/core';
import * as THREE from 'three';

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<AetherApp>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize game
    const game = new AetherApp();
    gameRef.current = game;

    // Basic Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Simple cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;

    // Game loop
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    game.start();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      game.stop();
    };
  }, []);

  return <div ref={mountRef} />;
}
