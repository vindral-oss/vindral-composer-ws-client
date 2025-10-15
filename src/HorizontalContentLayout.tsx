import React from "react";
import type { ComposerAudioObject, UniqueSelection } from "./App";

interface HorizontalContentLayoutProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
}

export const HorizontalContentLayout: React.FC<
  HorizontalContentLayoutProps
> = ({ audioObject, setCurrentSelectionFn }) => (
  <div className="flex flex-col gap-2 w-full">
    {audioObject.Properties.map((property) => (
      <div
        key={property.PropertyName}
        className="flex flex-row items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex-auto gap-4"
      >
        <div className="flex items-center flex-1 min-w-[90px]">
          <span
            onClick={() =>
              property.CanWrite &&
              setCurrentSelectionFn({
                AudioStripName: audioObject.Name,
                PropertyId: audioObject.Id,
                PropertyName: property.PropertyName,
              })
            }
            className={`font-medium text-sm flex-1 truncate break-words max-w-full ${
              property.CanWrite
                ? "cursor-pointer text-blue-700"
                : "cursor-not-allowed text-gray-400"
            }`}
            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {property.PropertyName}
          </span>
          {property.PropertyDescription &&
            property.PropertyDescription.trim() !== "" && (
              <span
                className="ml-1 text-xs text-gray-400 bg-gray-200 rounded-full px-1 cursor-help"
                title={property.PropertyDescription}
                style={{ userSelect: "none" }}
              >
                ?
              </span>
            )}
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-mono border transition-colors duration-150
            ${
              property.CanWrite
                ? "border-blue-300 bg-blue-50 text-blue-900 shadow-sm"
                : "border-gray-200 bg-gray-100 text-gray-500 cursor-default"
            }
          `}
          style={{ pointerEvents: "none", minWidth: "60px" }}
        >
          {String(property.Value)}
        </div>
        <div
          className={`text-xs px-2 py-1 rounded text-center ${
            property.CanWrite
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-500"
          }`}
          style={{ minWidth: "60px" }}
        >
          {property.CanWrite ? "Write" : "Read"}
        </div>
      </div>
    ))}
  </div>
);
