import { createContext } from "react";
import type { ComposerAudioObject } from "../types";

// Audio Context - store content from parsed AudioMixerSummary messages
export interface AudioState {
  audioStrips?: ComposerAudioObject[];
  sendResetKey: number;
}

export interface AudioActions {
  setAudioStrips: (strips?: ComposerAudioObject[]) => void;
  incrementSendResetKey: () => void;
}

export type AudioContextType = AudioState & AudioActions;

export const AudioContext = createContext<AudioContextType | undefined>(
  undefined
);
