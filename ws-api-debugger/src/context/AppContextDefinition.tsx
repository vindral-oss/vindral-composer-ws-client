import { createContext } from "react";
import type { ComposerAudioObject, Subscription } from "../types";

export interface AppState {
  // Connection state
  socketUrl: string;
  isConnected: boolean;
  urlError: string;

  // Message state
  totalMessageCount: number;
  pausedIncoming: boolean;
  pausedOutgoing: boolean;

  // Subscription state
  activeSubscriptions: Subscription[];

  // Audio state
  audioStrips?: ComposerAudioObject[];
  sendResetKey: number;
}

export interface AppActions {
  // Connection actions
  setSocketUrl: (url: string) => void;
  setIsConnected: (connected: boolean) => void;
  setUrlError: (error: string) => void;

  // Message actions
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
  setPausedIncoming: (paused: boolean) => void;
  setPausedOutgoing: (paused: boolean) => void;

  // Subscription actions
  setActiveSubscriptions: (subscriptions: Subscription[]) => void;

  // Audio actions
  setAudioStrips: (strips?: ComposerAudioObject[]) => void;
  incrementSendResetKey: () => void;
}

export type AppContextType = AppState & AppActions;

export const AppContext = createContext<AppContextType | undefined>(undefined);
