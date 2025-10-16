import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import type { ComposerAudioObject } from "../App";
import type { ComposerProperty } from "../App";
import Fab from "@mui/material/Fab";
import { EnumTypeScraper, type EnumTypeInfo } from "./EnumTypeScraper";

export interface Message {
  Type: string;
  Content: string;
}
export interface SendMessageProps {
  audioStrips: ComposerAudioObject[];
  sendMessageFn: (message: Message) => void;
}

export function SendMessage({ audioStrips, sendMessageFn }: SendMessageProps) {
  const [propertyValue, setPropertyValue] = useState<string>("");
  const [selectedAudioStripName, setSelectedAudioStripName] =
    useState<string>("");
  const [selectedPropertyName, setSelectedPropertyName] = useState<string>("");
  const selectedAudioStripObject = audioStrips.filter(
    (strip: ComposerAudioObject) => strip.Name === selectedAudioStripName
  );
  const [selectedPropertyObject, setSelectedPropertyObject] =
    useState<ComposerProperty>();
  const [enumTypeInfo, setEnumTypeInfo] = useState<EnumTypeInfo | null>(null);
  const [enumLoading, setEnumLoading] = useState(false);

  // Reset propertyValue when property changes
  useEffect(() => {
    setPropertyValue("");
  }, [selectedPropertyName, selectedPropertyObject]);

  // Get the selected audio strip ID
  const selectedAudioStripId =
    selectedAudioStripObject.length > 0 ? selectedAudioStripObject[0].Id : "";

  // Build the message object
  const messageObject = {
    Type: "SetPropertyValueByObjectId",
    Content: JSON.stringify(
      {
        ObjectId: selectedAudioStripId,
        PropertyName: selectedPropertyName,
        Value: propertyValue,
      },
      null,
      2
    ),
  };

  useEffect(() => {
    if (selectedAudioStripObject.length === 1 && selectedPropertyName !== "") {
      const prop = selectedAudioStripObject[0].Properties.filter(
        (p) => p.PropertyName === selectedPropertyName
      );
      setSelectedPropertyObject(prop[0]);
    }
  }, [selectedAudioStripObject, selectedPropertyName]);

  // Helper to determine type
  const getTSTypeFromObjectTypeString = (type: string) => {
    switch (type) {
      case "Single":
        return "number";
      case "Boolean":
        return "boolean";
      case "string":
        return "string";
      default:
        console.log("Its an enum!?");
        return "enum";
    }
  };

  // Fetch enum info when needed
  useEffect(() => {
    const type = selectedPropertyObject?.PropertyType || "";
    const tsType = getTSTypeFromObjectTypeString(type);
    if (type && tsType === "enum") {
      setEnumLoading(true);
      EnumTypeScraper.fetchEnumInfo(type).then((info) => {
        setEnumTypeInfo(info);
        setEnumLoading(false);
        console.log("Fetched enum info:", info);
      });
    } else {
      setEnumTypeInfo(null);
      setEnumLoading(false);
    }
  }, [selectedPropertyObject?.PropertyType]);

  // Format the message as pretty JSON for display
  const messagePreview = JSON.stringify(messageObject, null, 2);

  return (
    <Box component="section" className="mb-8">
      <div className="grid grid-cols-2 gap-4 items-start">
        {/* Left column: controls */}
        <div>
          <FormControl
            sx={{ padding: "6px 0", margin: "" }}
            fullWidth
            className="text-xs"
          >
            <InputLabel id="audio-strip-label" className="text-xs">
              Audio strip
            </InputLabel>
            <Select
              labelId="audio-strip-label"
              id="audio-strip"
              size="small"
              value={selectedAudioStripName}
              label="Audio strip"
              onChange={(e) => {
                setSelectedAudioStripName(e.target.value);
              }}
            >
              {audioStrips?.map((audioObject: ComposerAudioObject) => (
                <MenuItem
                  key={audioObject.Id}
                  value={audioObject.Name}
                  className="text-xs"
                >
                  {audioObject.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{ padding: "6px 0", margin: "6px 0" }}
            fullWidth
            className="text-xs"
          >
            <InputLabel id="property-name-label" className="text-xs">
              Property name
            </InputLabel>
            <Select
              labelId="property-name-label"
              id="property-name"
              size="small"
              value={selectedPropertyName}
              label="Property name"
              onChange={(e) => setSelectedPropertyName(e.target.value)}
            >
              {selectedAudioStripObject.length === 1 &&
                selectedAudioStripObject[0].Properties.map(
                  (property: ComposerProperty) =>
                    property.CanWrite && (
                      <MenuItem
                        key={property.PropertyName}
                        value={property.PropertyName}
                        className="text-xs"
                      >
                        {property.PropertyName}
                      </MenuItem>
                    )
                )}
            </Select>
          </FormControl>
          <div className="flex mt-2 gap-x-4 text-xs items-center">
            {/* Conditionally render value input based on type */}
            {(() => {
              const type = selectedPropertyObject?.PropertyType || "";
              const tsType = getTSTypeFromObjectTypeString(type);
              if (tsType === "number" || tsType === "string") {
                return (
                  <TextField
                    fullWidth
                    id="value"
                    label="Value"
                    size="small"
                    variant="outlined"
                    onChange={(e) => setPropertyValue(e.target.value)}
                    value={propertyValue}
                  />
                );
              }
              if (tsType === "boolean") {
                return (
                  <FormControl fullWidth>
                    <InputLabel shrink htmlFor="value-switch">
                      Value
                    </InputLabel>
                    <Switch
                      id="value-switch"
                      checked={propertyValue === "true"}
                      onChange={(e) =>
                        setPropertyValue(e.target.checked ? "true" : "false")
                      }
                    />
                  </FormControl>
                );
              }
              if (tsType === "enum") {
                if (enumLoading) {
                  return (
                    <span className="ml-2 text-xs text-gray-500">
                      Loading enum values...
                    </span>
                  );
                }
                if (enumTypeInfo && enumTypeInfo.values.length > 0) {
                  // Set default value to first enum value if not set
                  if (!propertyValue) {
                    setPropertyValue(enumTypeInfo.values[0].value);
                  }
                  return (
                    <FormControl fullWidth>
                      <InputLabel id="enum-value-label">Value</InputLabel>
                      <Select
                        labelId="enum-value-label"
                        id="enum-value"
                        size="small"
                        value={propertyValue}
                        label="Value"
                        onChange={(e) => setPropertyValue(e.target.value)}
                      >
                        {enumTypeInfo.values.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs"
                          >
                            {opt.value} ({opt.name})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }
                // fallback if no values
                return (
                  <TextField
                    fullWidth
                    id="value"
                    label="Value"
                    size="small"
                    variant="outlined"
                    onChange={(e) => setPropertyValue(e.target.value)}
                    value={propertyValue}
                  />
                );
              }
              // fallback
              return (
                <TextField
                  fullWidth
                  id="value"
                  label="Value"
                  size="small"
                  variant="outlined"
                  onChange={(e) => setPropertyValue(e.target.value)}
                  value={propertyValue}
                />
              );
            })()}
            {/* Show type as a link if enum */}
            {selectedPropertyObject?.PropertyType &&
              enumTypeInfo &&
              enumTypeInfo.href && (
                <a
                  href={enumTypeInfo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-orange-600 underline"
                >
                  {selectedPropertyObject.PropertyType}
                </a>
              )}
          </div>
        </div>
        {/* Right column: content preview + button */}
        <div className="relative flex flex-col pt-1 h-full">
          <Fab
            onClick={() => {
              navigator.clipboard.writeText(messagePreview);
            }}
            className="!absolute top-2 right-2 z-10"
            aria-label="Copy JSON"
            size="small"
            sx={{
              backgroundColor: "#ff9800",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              "&:hover": {
                backgroundColor: "#fb8c00",
              },
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </Fab>
          <pre
            className="bg-gray-100 rounded p-4 mr-1 min-h-[168px] text-xs overflow-auto mb-4 relative"
            id="message-content-preview"
          >
            {messagePreview}
          </pre>
          <Button
            variant="contained"
            name="setWsUrl"
            onClick={() => {
              const updatedMessage = {
                Type: "SetPropertyValueByObjectId",
                Content: JSON.stringify({
                  ObjectId: audioStrips.filter(
                    (strip) => strip.Name === selectedAudioStripName
                  )[0].Id,
                  PropertyName: selectedPropertyName,
                  Value: propertyValue,
                }),
              };
              sendMessageFn(updatedMessage);
            }}
            disabled={
              !selectedAudioStripId || !selectedPropertyName || !propertyValue
            }
            sx={{
              backgroundColor: "#ff9800",
              color: "#fff",
              fontWeight: "bold",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              border: "none",
              "&:hover": {
                backgroundColor: "#fb8c00",
              },
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </Box>
  );
}
