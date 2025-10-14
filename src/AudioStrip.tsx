// MUI imports removed, now using Tailwind for layout
import type { ComposerAudioObject, UniqueSelection } from "./App";
// import { styled } from "@mui/material/styles"; // not used

export interface AudioStripProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
  lastUpdateProperty?: UniqueSelection;
}

// StyledTableCell and StyledTableRow removed

export const AudioStrip = ({
  audioObject,
  setCurrentSelectionFn,
  lastUpdateProperty,
}: AudioStripProps) => (
  <div className="rounded-xl shadow-lg bg-white p-6 flex flex-col gap-4 border border-gray-200 min-w-[320px] max-w-[400px]">
    <div className="flex items-center justify-between mb-2">
      <div>
        <div className="font-semibold text-lg text-gray-900">
          {audioObject.Name}
        </div>
        <div className="text-xs text-gray-500">ID: {audioObject.Id}</div>
      </div>
      <div className="flex gap-2">
        {/* Add any strip-level controls here if needed */}
      </div>
    </div>
    <div className="flex flex-col gap-2">
      {audioObject.Properties.map((property) => (
        <div
          key={property.PropertyName}
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
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
            className={`flex-1 font-medium text-sm ${
              property.CanWrite
                ? "cursor-pointer text-blue-700"
                : "cursor-not-allowed text-gray-400"
            }`}
            title={property.PropertyDescription}
          >
            {property.PropertyName}
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-mono border transition-colors duration-150
              ${
                property.CanWrite
                  ? "border-blue-300 bg-blue-50 text-blue-900 shadow-sm"
                  : "border-gray-200 bg-gray-100 text-gray-500 cursor-default"
              }
              ${
                lastUpdateProperty?.PropertyName === property.PropertyName &&
                lastUpdateProperty?.PropertyId === audioObject.Id
                  ? "flash border-blue-400 bg-blue-50"
                  : ""
              }
            `}
            style={{ pointerEvents: "none" }}
          >
            {String(property.Value)}
          </div>
          <div
            className={`text-xs px-2 py-1 rounded ${
              property.CanWrite
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {property.CanWrite ? "Write" : "Read"}
          </div>
        </div>
      ))}
    </div>
  </div>
);
