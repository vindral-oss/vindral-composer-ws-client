import React from "react";
import type { ComposerAudioObject, UniqueSelection } from "./App";

interface GridContentLayoutProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
}

export const GridContentLayout: React.FC<GridContentLayoutProps> = ({
  audioObject,
  setCurrentSelectionFn,
}) => (
  <div className="grid grid-cols-2 gap-4 w-full">
    {audioObject.Properties.map((property, idx) => (
      <div
        key={audioObject.Id + "-" + property.PropertyName + "-" + idx}
        className="flex flex-col items-start px-2 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[100px] w-full"
      >
        <div
          onClick={() =>
            property.CanWrite &&
            setCurrentSelectionFn({
              AudioStripName: audioObject.Name,
              PropertyId: audioObject.Id,
              PropertyName: property.PropertyName,
            })
          }
          className={`font-medium text-sm mb-1 truncate break-words max-w-full ${
            property.CanWrite
              ? "cursor-pointer text-blue-700"
              : "cursor-not-allowed text-gray-400"
          }`}
          title={property.PropertyDescription}
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {property.PropertyName}
        </div>
        <div className="flex flex-row gap-2 w-full">
          <div
            className={`px-2 py-1 rounded text-xs font-mono border w-full transition-colors duration-150
              ${
                property.CanWrite
                  ? "border-blue-300 bg-blue-50 text-blue-900 shadow-sm"
                  : "border-gray-200 bg-gray-100 text-gray-500 cursor-default"
              }
            `}
            style={{ pointerEvents: "none" }}
          >
            {String(property.Value)}
          </div>
          <div
            className={`text-xs px-2 py-1 rounded w-20 text-center ${
              property.CanWrite
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {property.CanWrite ? "Write" : "Read"}
          </div>
        </div>
      </div>
    ))}
  </div>
);
