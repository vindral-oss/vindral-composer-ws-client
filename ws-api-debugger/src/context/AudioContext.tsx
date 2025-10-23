import React, { useState, useCallback } from "react";
import {
  AudioContext,
  type AudioContextType,
  type AudioState,
  type AudioActions,
} from "./AudioContextDefinition";
import type { ComposerAudioObject } from "../types";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioState>({
    audioStrips: undefined,
    sendResetKey: 0,
  });

  const actions: AudioActions = {
    setAudioStrips: useCallback((strips?: ComposerAudioObject[]) => {
      setState((prev) => ({ ...prev, audioStrips: strips }));
    }, []),

    incrementSendResetKey: useCallback(() => {
      setState((prev) => ({ ...prev, sendResetKey: prev.sendResetKey + 1 }));
    }, []),
  };

  const contextValue: AudioContextType = {
    ...state,
    ...actions,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}
