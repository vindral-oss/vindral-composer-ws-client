import { createContext } from "react";

// Messages Context - stores message related data
export interface MessagesState {
  totalMessageCount: number;
  pausedIncoming: boolean;
  pausedOutgoing: boolean;
}

export interface MessagesActions {
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
  setPausedIncoming: (paused: boolean) => void;
  setPausedOutgoing: (paused: boolean) => void;
  registerIncomingHandler: (handler: (event: MessageEvent) => void) => void;
  registerOutgoingHandler: (handler: (event: MessageEvent) => void) => void;
  handleIncomingMessage: (event: MessageEvent) => void;
  handleOutgoingMessage: (event: MessageEvent) => void;
}

export type MessagesContextType = MessagesState & MessagesActions;

export const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);
