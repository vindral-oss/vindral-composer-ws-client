import React from "react";
import { AudioStrip } from "./AudioStrip";
import type { ComposerAudioObject, UniqueSelection } from "./App";

interface AudioStripsProps {
  audioStrips: ComposerAudioObject[];
  setCurrentSelectionFn: (props: UniqueSelection) => void;
}

// Custom shallow compare for audioObject
function shallowEqual(objA: ComposerAudioObject, objB: ComposerAudioObject) {
  if (objA === objB) return true;
  if (objA.Id !== objB.Id) return false;
  if (objA.Name !== objB.Name) return false;
  if (objA.Properties.length !== objB.Properties.length) return false;
  for (let i = 0; i < objA.Properties.length; i++) {
    const a = objA.Properties[i];
    const b = objB.Properties[i];
    if (
      a.PropertyName !== b.PropertyName ||
      a.Value !== b.Value ||
      a.CanWrite !== b.CanWrite
    ) {
      return false;
    }
  }
  return true;
}

const MemoizedAudioStrip = React.memo(
  AudioStrip,
  (prevProps, nextProps) => shallowEqual(prevProps.audioObject, nextProps.audioObject)
);

export const AudioStrips: React.FC<AudioStripsProps> = React.memo(({ audioStrips, setCurrentSelectionFn }) => {
  return (
    <>
      {audioStrips.map(audioObject => (
        <MemoizedAudioStrip
          key={audioObject.Id}
          audioObject={audioObject}
          setCurrentSelectionFn={setCurrentSelectionFn}
        />
      ))}
    </>
  );
});
