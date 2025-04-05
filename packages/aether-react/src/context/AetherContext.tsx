import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { AetherApp } from '@aether/core';

interface AetherContextType {
  app: AetherApp | null;
  setApp: (app: AetherApp | null) => void;
}

export const AetherContext = createContext<AetherContextType>({
  app: null,
  setApp: () => {}
});

interface AetherProviderProps {
  children: ReactNode;
}

export const AetherProvider: React.FC<AetherProviderProps> = ({ children }) => {
  const [app, setAppState] = useState<AetherApp | null>(null);
  
  const setApp = useCallback((newApp: AetherApp | null) => {
    setAppState(newApp);
  }, []);
  
  return (
    <AetherContext.Provider value={{ app, setApp }}>
      {children}
    </AetherContext.Provider>
  );
};