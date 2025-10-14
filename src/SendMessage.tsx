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
        <h2 className="text-base font-bold mb-3">Send message</h2>
        <div className="mb-4 text-xs">
          Construct your message, or click any writeable property in the
          table(s)
        </div>
        <FormControl sx={{ padding: "6px 0" }} fullWidth className="text-xs">
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
            {audioStrips?.map((audioObject) => (
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
                (property) =>
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
        <div className="flex mt-2 gap-x-4 text-xs">
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
              sendMessageFn(JSON.stringify(updatedMessage));
            }}
            className="bg-[#FDBF79] text-black font-bold border-none hover:bg-[#fda94d]"
          >
            Send
          </Button>
        </div>
      </div>
    </Box>
  );
}
