import React from "react";
import type { ComposerAudioObject, UniqueSelection } from "./App";

interface VerticalContentLayoutProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
}

export const VerticalContentLayout: React.FC<VerticalContentLayoutProps> = ({
  audioObject,
  setCurrentSelectionFn,
}) => (
  <div className="flex flex-row flex-wrap gap-4">
    {audioObject.Properties.map((property) => (
      <div
        key={property.PropertyName}
        className="flex flex-col items-start px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[180px] max-w-[220px] flex-1"
      >
        <div className="flex items-center w-full mb-1">
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
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
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
