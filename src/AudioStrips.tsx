import React from "react";
import { AudioStrip } from "./AudioStrip";
import type { ComposerAudioObject, UniqueSelection } from "./App";

interface AudioStripsProps {
  audioStrips: ComposerAudioObject[];
  setCurrentSelectionFn: (props: UniqueSelection) => void;
  layout: "horizontal" | "vertical" | "grid";
  currentSelection?: UniqueSelection;
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

const MemoizedAudioStrip = React.memo(AudioStrip, (prevProps, nextProps) => {
  const audioEqual = shallowEqual(prevProps.audioObject, nextProps.audioObject);
  const layoutEqual = prevProps.layout === nextProps.layout;
  const selectionEqual =
    JSON.stringify(prevProps.currentSelection) ===
    JSON.stringify(nextProps.currentSelection);
  return audioEqual && layoutEqual && selectionEqual;
});

export const AudioStrips: React.FC<AudioStripsProps> = React.memo(
  ({
    audioStrips,
    setCurrentSelectionFn,
    layout,
    currentSelection,
  }: AudioStripsProps) => {
    if (layout === "grid") {
      return (
        <div className="flex flex-row flex-wrap gap-6">
          {audioStrips.map((audioObject: ComposerAudioObject) => (
            <div
              key={audioObject.Id}
              className="flex-1 min-w-[340px] max-w-[480px]"
            >
              <MemoizedAudioStrip
                audioObject={audioObject}
                setCurrentSelectionFn={setCurrentSelectionFn}
                layout="grid"
                currentSelection={currentSelection}
              />
            </div>
          ))}
        </div>
      );
    }
    return (
      <>
        {audioStrips.map((audioObject: ComposerAudioObject) => (
          <MemoizedAudioStrip
            key={audioObject.Id}
            audioObject={audioObject}
            setCurrentSelectionFn={setCurrentSelectionFn}
            layout={layout}
            currentSelection={currentSelection}
          />
        ))}
      </>
    );
  }
);
