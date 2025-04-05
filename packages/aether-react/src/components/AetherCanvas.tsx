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

    let appInstance: AetherApp | null = null;

    try {
      appInstance = new AetherApp({
        ...options,
        canvas: canvasRef.current
      });

      setApp({ instance: appInstance, loadingState: 'initializing' });

      appInstance.start();
      setApp({ instance: appInstance, loadingState: 'loading-assets' });

      if (onReady) onReady(appInstance);
      setApp({ instance: appInstance, loadingState: 'ready' });

    } catch (error) {
      console.error('AetherEngine initialization failed:', error);
      setApp({
        instance: null,
        error: error instanceof Error ? error : new Error('Engine initialization failed'),
        loadingState: 'error'
      });
    }

    return () => {
      if (appInstance) {
        appInstance.dispose();
      }
      setApp({ instance: null, loadingState: 'idle' });
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
