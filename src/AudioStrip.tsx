// MUI imports removed, now using Tailwind for layout
import type { ComposerAudioObject, UniqueSelection } from "./App";
// import { styled } from "@mui/material/styles"; // not used

export interface AudioStripProps {
  audioObject: ComposerAudioObject;
  setCurrentSelectionFn: (props: UniqueSelection) => void;
  layout?: "horizontal" | "vertical" | "grid";
}

export const AudioStrip = ({
  audioObject,
  setCurrentSelectionFn,
  layout = "horizontal",
}: AudioStripProps) => {
  let propertiesLayout;
  if (layout === "horizontal") {
    propertiesLayout = (
      <div className="flex flex-row flex-wrap gap-1">
        {audioObject.Properties.map((property) => (
          <div
            key={property.PropertyName}
            className="flex flex-row items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex-auto gap-4"
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
              className={`font-medium text-sm flex-1 ${
                property.CanWrite
                  ? "cursor-pointer text-blue-700"
                  : "cursor-not-allowed text-gray-400"
              }`}
              title={property.PropertyDescription}
              style={{ minWidth: "90px" }}
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
  } else if (layout === "vertical") {
    propertiesLayout = (
      <div className="flex flex-row flex-wrap gap-4">
        {audioObject.Properties.map((property) => (
          <div
            key={property.PropertyName}
            className="flex flex-col items-start px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[180px] max-w-[220px] flex-1"
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
              className={`font-medium text-sm mb-1 ${
                property.CanWrite
                  ? "cursor-pointer text-blue-700"
                  : "cursor-not-allowed text-gray-400"
              }`}
              title={property.PropertyDescription}
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
  } else if (layout === "grid") {
    propertiesLayout = (
      <div className="grid grid-cols-2 gap-4">
        {audioObject.Properties.map((property, idx) => (
          <div
            key={audioObject.Id + "-" + property.PropertyName + "-" + idx}
            className="flex flex-col items-start px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[180px] max-w-[220px] flex-1"
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
              className={`font-medium text-sm mb-1 ${
                property.CanWrite
                  ? "cursor-pointer text-blue-700"
                  : "cursor-not-allowed text-gray-400"
              }`}
              title={property.PropertyDescription}
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
  } else {
    propertiesLayout = (
      <div className="flex flex-col gap-4">
        {audioObject.Properties.map((property) => (
          <div
            key={property.PropertyName}
            className="flex flex-col items-start px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
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
              className={`font-medium text-sm mb-1 ${
                property.CanWrite
                  ? "cursor-pointer text-blue-700"
                  : "cursor-not-allowed text-gray-400"
              }`}
              title={property.PropertyDescription}
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
      {propertiesLayout}
    </div>
  );
};
