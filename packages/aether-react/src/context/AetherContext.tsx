import type AetherApp from "@aether/core/src/aetherApp";
import React, { createContext, useState, useCallback, ReactNode } from "react";

export type LoadingState =
  | "idle"
  | "initializing"
  | "loading-assets"
  | "ready"
  | "error";

export interface AetherContextType {
  app: AetherApp | null;
  loadingState: LoadingState;
  error: Error | null;
  setApp: (state: {
    instance: AetherApp | null;
    loadingState?: LoadingState;
    error?: Error | null;
  }) => void;
}

export const AetherContext = createContext<AetherContextType>({
  app: null,
  loadingState: "idle",
  error: null,
  setApp: () => {},
});

interface AetherProviderProps {
  children: ReactNode;
}

export const AetherProvider = ({
  children,
}: AetherProviderProps): React.ReactElement => {
  const [state, setState] = useState<{
    app: AetherApp | null;
    loadingState: LoadingState;
    error: Error | null;
  }>({
    app: null,
    loadingState: "idle",
    error: null,
  });

  const setApp = useCallback(
    (newState: {
      instance: AetherApp | null;
      loadingState?: LoadingState;
      error?: Error | null;
    }) => {
      setState((prevState) => ({
        app: newState.instance,
        loadingState: newState.loadingState ?? prevState.loadingState,
        error: newState.error ?? prevState.error,
      }));
    },
    []
  );

  return (
    <AetherContext.Provider
      value={{
        app: state.app,
        loadingState: state.loadingState,
        error: state.error,
        setApp,
      }}
    >
      {children}
    </AetherContext.Provider>
  );
};
