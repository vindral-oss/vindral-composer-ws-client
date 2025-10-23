import React, { useEffect, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import type { ComposerAudioObject, ComposerProperty } from "../types";
import Fab from "@mui/material/Fab";
import Snackbar from "@mui/material/Snackbar";
import { EnumPopover } from "../DocsScraper/EnumPopover";
import {
  EnumTypeScraper,
  type EnumTypeInfo,
} from "../DocsScraper/EnumTypeScraper";

export interface Message {
  Type: string;
  Content: string;
}

export interface SendMessageProps {
  audioStrips: ComposerAudioObject[];
  sendMessageFn: (message: Message) => void;
  resetKey?: string | number;
}

// Helper to determine TS type from Composer type - moved outside component to avoid recreation
const getTSTypeFromObjectTypeString = (type: string) => {
  switch (type) {
    // Might be int or float, but treat both as number for input purposes
    case "Single":
      return "number";
    case "Boolean":
      return "boolean";
    case "string":
      return "string";
    default:
      return "enum";
  }
};

export const SendMessage = ({
  audioStrips,
  sendMessageFn,
  resetKey,
}: SendMessageProps) => {
  const [propertyValue, setPropertyValue] = useState<string>("");
  const [selectedAudioStripId, setSelectedAudioStripId] = useState<string>("");
  const [selectedPropertyName, setSelectedPropertyName] = useState<string>("");
  const selectedAudioStripObject = useMemo(() => {
    return audioStrips.filter(
      (strip: ComposerAudioObject) => strip.Id === selectedAudioStripId
    );
  }, [audioStrips, selectedAudioStripId]);
  const [selectedPropertyObject, setSelectedPropertyObject] =
    useState<ComposerProperty>();
  const [enumTypeInfo, setEnumTypeInfo] = useState<EnumTypeInfo | null>(null);
  const [enumLoading, setEnumLoading] = useState(false);

  useEffect(() => {
    // Allow sending boolean type message even though no input change
    const type = selectedPropertyObject?.PropertyType || "";
    const tsType = getTSTypeFromObjectTypeString(type);
    if (tsType === "boolean") {
      setPropertyValue("false");
    } else {
      setPropertyValue("");
    }
  }, [selectedPropertyName, selectedPropertyObject]);

  useEffect(() => {
    setPropertyValue("");
    setSelectedAudioStripId("");
    setSelectedPropertyName("");
    setSelectedPropertyObject(undefined);
    setEnumTypeInfo(null);
  }, [resetKey]);

  const currentAudioStripId =
    selectedAudioStripObject.length > 0 ? selectedAudioStripObject[0].Id : "";

  // Construct the message template object to send (based on select choices)
  const messageObject = {
    Type: "SetPropertyValueByObjectId",
    Content: JSON.stringify(
      {
        ObjectId: currentAudioStripId,
        PropertyName: selectedPropertyName,
        Value: propertyValue,
      },
      null,
      2
    ),
  };

  // Memoize the selected property to avoid recreating on every render
  const selectedProperty = useMemo(() => {
    if (selectedAudioStripObject.length === 1 && selectedPropertyName !== "") {
      return selectedAudioStripObject[0].Properties.find(
        (p: ComposerProperty) => p.PropertyName === selectedPropertyName
      );
    }
    return undefined;
  }, [selectedAudioStripObject, selectedPropertyName]);

  // Update selected property object when the memoized property changes
  useEffect(() => {
    setSelectedPropertyObject(selectedProperty);
  }, [selectedProperty]);

  // Fetch enum info for a Composer property type - when needed
  useEffect(() => {
    const type = selectedPropertyObject?.PropertyType || "";
    const tsType = getTSTypeFromObjectTypeString(type);
    if (type && tsType === "enum") {
      setEnumLoading(true);
      EnumTypeScraper.fetchEnumInfo(type).then((info) => {
        setEnumTypeInfo(info);
        setEnumLoading(false);
      });
    } else {
      setEnumTypeInfo(null);
      setEnumLoading(false);
    }
  }, [selectedPropertyObject?.PropertyType]);

  // Set default value for enum type only when enumTypeInfo changes and propertyValue is empty
  useEffect(() => {
    if (enumTypeInfo && enumTypeInfo.values.length > 0 && !propertyValue) {
      setPropertyValue(enumTypeInfo.values[0].value);
    }
  }, [enumTypeInfo, propertyValue]);

  const messagePreview = JSON.stringify(messageObject, null, 2);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleCopy = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    navigator.clipboard.writeText(messagePreview);
    setSnackbarOpen(true);
  };
  return (
    <Box component="section" className="mb-8">
      <div className="flex flex-wrap gap-4 items-start">
        {/* Left column: select choices */}
        <div className="w-full">
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
              value={selectedAudioStripId}
              label="Audio strip"
              onChange={(e) => {
                setSelectedAudioStripId(e.target.value);
              }}
            >
              {audioStrips?.map((audioObject: ComposerAudioObject) => (
                <MenuItem
                  key={audioObject.Id}
                  value={audioObject.Id}
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
                selectedAudioStripObject[0].Properties.filter(
                  (property: ComposerProperty) => property.CanWrite
                ).map((property: ComposerProperty) => (
                  <MenuItem
                    key={property.PropertyName}
                    value={property.PropertyName}
                    className="text-xs"
                  >
                    {property.PropertyName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <div className="flex flex-wrap mt-2 gap-x-4 text-xs items-start w-full">
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
                    sx={{ minWidth: 0, flex: 1 }}
                  />
                );
              }
              if (tsType === "boolean") {
                return (
                  <FormControl fullWidth sx={{ minWidth: 0, flex: 1 }}>
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
                  return (
                    <FormControl fullWidth sx={{ minWidth: 0, flex: 1 }}>
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
                // fallback if no values (i.e single = int)
                return (
                  <TextField
                    fullWidth
                    id="value"
                    label="Value"
                    size="small"
                    variant="outlined"
                    onChange={(e) => setPropertyValue(e.target.value)}
                    value={propertyValue}
                    sx={{ minWidth: 0, flex: 1 }}
                  />
                );
              }
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
            {/* Show type as a link to Composer doxygen if enum, with popover iframe on click */}
            {selectedPropertyObject?.PropertyType && enumTypeInfo?.href && (
              <div className="w-full wrap-break-word mt-2">
                <EnumPopover
                  href={enumTypeInfo.href}
                  typeName={selectedPropertyObject?.PropertyType || "Type"}
                />
              </div>
            )}
          </div>
        </div>
        <div className="relative flex flex-col pt-1 h-full w-full">
          <Fab
            onClick={(e) => handleCopy(e)}
            className="absolute! top-2 right-2 z-10"
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
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => setSnackbarOpen(false)}
            message="Copied to clipboard!"
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          />
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
                  ObjectId: selectedAudioStripId,
                  PropertyName: selectedPropertyName,
                  Value: propertyValue,
                }),
              };
              sendMessageFn(updatedMessage);
            }}
            disabled={
              !currentAudioStripId || !selectedPropertyName || !propertyValue
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
};
