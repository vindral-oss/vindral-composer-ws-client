import type { ComposerAudioObject, UniqueSelection } from "./App";
import { VerticalContentLayout } from "./VerticalContentLayout";
import { HorizontalContentLayout } from "./HorizontalContentLayout";
import { GridContentLayout } from "./GridContentLayout";

export interface AudioStripProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
  layout?: "horizontal" | "vertical" | "grid";
  currentSelection?: UniqueSelection;
}

export const AudioStrip = ({
  audioObject,
  setCurrentSelectionFn,
  layout,
  currentSelection,
}: AudioStripProps) => {
  let ContentLayout;
  if (layout === "vertical") {
    ContentLayout = VerticalContentLayout;
  } else if (layout === "grid") {
    ContentLayout = GridContentLayout;
  } else {
    ContentLayout = HorizontalContentLayout;
  }
  return (
    <div className="rounded-xl shadow-lg bg-white p-6 flex flex-col gap-4 border border-gray-200 w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-lg text-gray-900">
            {audioObject.Name}
          </div>
          <div className="text-xs text-gray-500">ID: {audioObject.Id}</div>
        </div>
        <div className="flex gap-2"></div>
      </div>
      <ContentLayout
        audioObject={audioObject}
        setCurrentSelectionFn={setCurrentSelectionFn}
        currentSelection={currentSelection}
      />
    </div>
  );
};
