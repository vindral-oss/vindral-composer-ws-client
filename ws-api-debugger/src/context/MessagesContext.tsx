import React, { useState, useCallback, useRef } from "react";
import {
  MessagesContext,
  type MessagesContextType,
  type MessagesState,
  type MessagesActions,
} from "./MessagesContextDefinition";

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MessagesState>({
    totalMessageCount: 0,
    pausedIncoming: false,
    pausedOutgoing: false,
  });

  // Use refs to store handlers to avoid re-rendering on handler registration
  const incomingHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );
  const outgoingHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  const actions: MessagesActions = {
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

    registerIncomingHandler: useCallback(
      (handler: (event: MessageEvent) => void) => {
        incomingHandlerRef.current = handler;
      },
      []
    ),

    registerOutgoingHandler: useCallback(
      (handler: (event: MessageEvent) => void) => {
        outgoingHandlerRef.current = handler;
      },
      []
    ),

    handleIncomingMessage: useCallback((event: MessageEvent) => {
      if (incomingHandlerRef.current) {
        incomingHandlerRef.current(event);
      }
    }, []),

    handleOutgoingMessage: useCallback((event: MessageEvent) => {
      if (outgoingHandlerRef.current) {
        outgoingHandlerRef.current(event);
      }
    }, []),
  };

  const contextValue: MessagesContextType = {
    ...state,
    ...actions,
  };

  return (
    <MessagesContext.Provider value={contextValue}>
      {children}
    </MessagesContext.Provider>
  );
}
