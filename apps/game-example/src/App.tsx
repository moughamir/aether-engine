import React, { useEffect, useState } from 'react';
import { AetherProvider, AetherCanvas } from '@aether/react';
import { AetherApp } from '@aether/core';
import { GameScene } from './scenes/GameScene';
import { UI } from './components/UI';
import './App.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [app, setAppInstance] = useState<AetherApp | null>(null);
  
  const handleReady = (app: AetherApp) => {
    setAppInstance(app);
    setIsLoading(false);
  };
  
  return (
    <AetherProvider>
      <div className="game-container">
        <AetherCanvas
          options={{
            physics: true,
            networking: true
          }}
          onReady={handleReady}
        />
        
        {isLoading ? (
          <div className="loading-screen">
            <h1>Loading Aether Engine...</h1>
          </div>
        ) : (
          <>
            <GameScene app={app} />
            <UI />
          </>
        )}
      </div>
    </AetherProvider>
  );
};

export default App;