import React from "react";
import type { ComposerAudioObject, UniqueSelection } from "./App";

interface GridContentLayoutProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
  currentSelection?: UniqueSelection;
}

export const GridContentLayout: React.FC<GridContentLayoutProps> = ({
  audioObject,
  setCurrentSelectionFn,
  currentSelection,
}) => (
  <div className="grid grid-cols-2 gap-4 w-full">
    {audioObject.Properties.map((property, idx) => {
      const isWritable = property.CanWrite;
      const isSelected =
        currentSelection &&
        currentSelection.PropertyId === audioObject.Id &&
        currentSelection.PropertyName === property.PropertyName;
      const handleClick = () => {
        if (isWritable) {
          setCurrentSelectionFn({
            AudioStripName: audioObject.Name,
            PropertyId: audioObject.Id,
            PropertyName: property.PropertyName,
          });
        }
      };
      return (
        <div
          key={audioObject.Id + "-" + property.PropertyName + "-" + idx}
          className={`flex flex-col items-start px-2 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[100px] w-full ${
            isWritable ? "cursor-pointer" : "cursor-not-allowed"
          } ${isSelected ? "outline-1 outline-black" : "border-transparent"}`}
          onClick={handleClick}
        >
          <div
            className={`font-medium text-sm mb-1 truncate break-words max-w-full ${
              isWritable ? "text-black" : "text-gray-400"
            }`}
            title={property.PropertyDescription}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {property.PropertyName}
          </div>
          <div className="flex flex-row gap-2 w-full">
            <div
              className={`px-2 py-1 rounded text-xs font-mono border w-full
                ${
                  isWritable
                    ? "border-blue-300 bg-blue-50 text-blue-900 shadow-sm"
                    : "border-gray-200 bg-gray-100 text-gray-500 cursor-default"
                }
              `}
            >
              {String(property.Value)}
            </div>
            <div
              className={`text-xs px-2 py-1 rounded w-20 text-center ${
                isWritable
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {isWritable ? "Write" : "Read"}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
