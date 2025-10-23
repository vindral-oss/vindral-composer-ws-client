import { createContext } from "react";

// Composer Context - stores information from Welcome messages
export interface ComposerState {
  composerVersion: string;
  projectName: string;
  composerOS: string;
}

export interface ComposerActions {
  setComposerInfo: (info: Partial<ComposerState>) => void;
}

export type ComposerContextType = ComposerState & ComposerActions;

export const ComposerContext = createContext<ComposerContextType | undefined>(
  undefined
);
