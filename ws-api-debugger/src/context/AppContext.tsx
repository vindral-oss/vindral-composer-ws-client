import React, { useState, useCallback } from "react";
import {
  AppContext,
  type AppContextType,
  type AppState,
  type AppActions,
} from "./AppContextDefinition";
import type { ComposerAudioObject, Subscription } from "../types";

export { AppContext, type AppContextType };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    socketUrl: "ws://localhost:8081",
    isConnected: false,
    urlError: "",
    totalMessageCount: 0,
    pausedIncoming: false,
    pausedOutgoing: false,
    activeSubscriptions: [],
    audioStrips: undefined,
    sendResetKey: 0,
  });

  const actions: AppActions = {
    setSocketUrl: useCallback((url: string) => {
      setState((prev) => ({ ...prev, socketUrl: url }));
    }, []),

    setIsConnected: useCallback((connected: boolean) => {
      setState((prev) => ({ ...prev, isConnected: connected }));
    }, []),

    setUrlError: useCallback((error: string) => {
      setState((prev) => ({ ...prev, urlError: error }));
    }, []),

    incrementMessageCount: useCallback(() => {
      setState((prev) => ({
        ...prev,
        totalMessageCount: prev.totalMessageCount + 1,
      }));
    }, []),

    resetMessageCount: useCallback(() => {
      setState((prev) => ({ ...prev, totalMessageCount: 0 }));
    }, []),

    setPausedIncoming: useCallback((paused: boolean) => {
      setState((prev) => ({ ...prev, pausedIncoming: paused }));
    }, []),

    setPausedOutgoing: useCallback((paused: boolean) => {
      setState((prev) => ({ ...prev, pausedOutgoing: paused }));
    }, []),

    setActiveSubscriptions: useCallback((subscriptions: Subscription[]) => {
      setState((prev) => ({ ...prev, activeSubscriptions: subscriptions }));
    }, []),

    setAudioStrips: useCallback((strips?: ComposerAudioObject[]) => {
      setState((prev) => ({ ...prev, audioStrips: strips }));
    }, []),

    incrementSendResetKey: useCallback(() => {
      setState((prev) => ({ ...prev, sendResetKey: prev.sendResetKey + 1 }));
    }, []),
  };

  const contextValue: AppContextType = {
    ...state,
    ...actions,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
