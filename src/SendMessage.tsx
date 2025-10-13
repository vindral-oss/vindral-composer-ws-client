import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import Button from "@mui/material/Button";
import { SendMessage as SendMessageFn } from "react-use-websocket";

export interface SendMessageProps {
  id?: string;
  property?: string;
  sendMessageFn: SendMessageFn;
}

export function SendMessage({ id, property, sendMessageFn }: SendMessageProps) {
  const [propertyValue, setPropertyValue] = useState<string>("");
  const messageToSend = {
    Type: "SetPropertyValueByObjectId",
    Content: {
      ObjectId: id,
      PropertyName: property,
      Value: propertyValue,
    },
  };
  return (
    <Box component="section" className="mb-8">
      <div>
        <h2 className="text-3xl">Send message</h2>
        <div>Selected ID: {id}</div>
        <div>Selected Property: {property}</div>
        <div className="flex gap-x-4">
          <TextField
            id="value"
            label="Value"
            variant="outlined"
            onChange={(e) => setPropertyValue(e.target.value)}
            value={propertyValue}
          />
          <Button
            variant="outlined"
            name="setWsUrl"
            onClick={() => {
              const updatedMessage = {
                ...messageToSend,
                Content: JSON.stringify(messageToSend.Content),
              };
              sendMessageFn(JSON.stringify(updatedMessage));
            }}
          >
            Send message
          </Button>
        </div>
      </div>
    </Box>
  );
}
