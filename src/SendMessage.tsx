import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import type { SendMessage as SendMessageFn } from "react-use-websocket";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { ComposerAudioObject } from "./App";

export interface SendMessageProps {
  audioStrips: ComposerAudioObject[];
  clickSelectedAudioStrip?: string;
  clickSelectedId?: string;
  clickSelectedProperty?: string;
  sendMessageFn: SendMessageFn;
}

export function SendMessage({
  audioStrips,
  clickSelectedAudioStrip,
  clickSelectedId,
  clickSelectedProperty,
  sendMessageFn,
}: SendMessageProps) {
  const [propertyValue, setPropertyValue] = useState<string>("");
  const [selectedAudioStripName, setSelectedAudioStripName] =
    useState<string>("");
  const [selectedPropertyName, setSelectedPropertyName] = useState<string>("");
  const selectedAudioStripObject = audioStrips.filter(
    (strip) => strip.Name === selectedAudioStripName
  );

  useEffect(() => {
    if (!clickSelectedAudioStrip) {
      return;
    } else {
      setSelectedAudioStripName(clickSelectedAudioStrip);
    }
  }, [clickSelectedAudioStrip]);

  useEffect(() => {
    if (!clickSelectedProperty) {
      return;
    }
    setSelectedPropertyName(clickSelectedProperty);
  }, [clickSelectedProperty]);
  return (
    <Box component="section" className="mb-8">
      <div>
        <h2 className="mt-2 text-3xl">Send message</h2>
        <div className="mb-4">
          Construct your message, or click any writeable property in the
          table(s)
        </div>
        <FormControl sx={{ padding: "6px 0" }} fullWidth>
          <InputLabel id="audio-strip-label">Audio strip</InputLabel>
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
            {audioStrips?.map((audioObject) => (
              <MenuItem key={audioObject.Id} value={audioObject.Name}>
                {audioObject.Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ padding: "6px 0", margin: "6px 0" }} fullWidth>
          <InputLabel id="property-name-label">Property name</InputLabel>
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
                (property) =>
                  property.CanWrite && (
                    <MenuItem
                      key={property.PropertyName}
                      value={property.PropertyName}
                    >
                      {property.PropertyName}
                    </MenuItem>
                  )
              )}
          </Select>
        </FormControl>
        <div className="flex mt-2 gap-x-4">
          <TextField
            fullWidth
            id="value"
            label="Value"
            size="small"
            variant="outlined"
            onChange={(e) => setPropertyValue(e.target.value)}
            value={propertyValue}
          />
          <Button
            variant="outlined"
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
              sendMessageFn(JSON.stringify(updatedMessage));
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </Box>
  );
}
