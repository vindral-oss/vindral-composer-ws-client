import React, { useState, useCallback } from "react";
import {
  ConnectionContext,
  type ConnectionContextType,
  type ConnectionState,
  type ConnectionActions,
} from "./ConnectionContextDefinition";

export function ConnectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ConnectionState>({
    socketUrl: "ws://localhost:8081",
    isConnected: false,
    urlError: "",
    readyState: 3, // CLOSED
  });

  const actions: ConnectionActions = {
    setSocketUrl: useCallback((url: string) => {
      setState((prev) => ({ ...prev, socketUrl: url }));
    }, []),

    setIsConnected: useCallback((connected: boolean) => {
      setState((prev) => ({ ...prev, isConnected: connected }));
    }, []),

    setUrlError: useCallback((error: string) => {
      setState((prev) => ({ ...prev, urlError: error }));
    }, []),

    setReadyState: useCallback((readyState: number) => {
      setState((prev) => ({ ...prev, readyState }));
    }, []),
  };

  const contextValue: ConnectionContextType = {
    ...state,
    ...actions,
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
}
