import React, { useRef, useEffect } from 'react';
import { AetherApp, AetherAppOptions } from '@aether/core';
import { useAether } from '../hooks/useAether';

export interface AetherCanvasProps {
  options?: Omit<AetherAppOptions, 'canvas'>;
  onReady?: (app: AetherApp) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AetherCanvas: React.FC<AetherCanvasProps> = ({
  options = {},
  onReady,
  className,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setApp } = useAether();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create Aether app with the canvas
    const app = new AetherApp({
      ...options,
      canvas: canvasRef.current
    });
    
    // Start the app
    app.start();
    
    // Set the app in context
    setApp(app);
    
    // Call onReady callback
    if (onReady) {
      onReady(app);
    }
    
    // Cleanup on unmount
    return () => {
      app.dispose();
      setApp(null);
    };
  }, [options, onReady, setApp]);
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        ...style
      }}
    />
  );
};