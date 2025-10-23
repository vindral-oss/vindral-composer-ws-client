import { createContext } from "react";

// Connection Context
export interface ConnectionState {
  socketUrl: string;
  isConnected: boolean;
  urlError: string;
  readyState: number;
}

export interface ConnectionActions {
  setSocketUrl: (url: string) => void;
  setIsConnected: (connected: boolean) => void;
  setUrlError: (error: string) => void;
  setReadyState: (state: number) => void;
}

export type ConnectionContextType = ConnectionState & ConnectionActions;

export const ConnectionContext = createContext<
  ConnectionContextType | undefined
>(undefined);
