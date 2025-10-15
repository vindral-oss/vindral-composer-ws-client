import React, { useState } from "react";
import { ReadyState } from "react-use-websocket";
import { ConnectionStatusIndicator } from "./ConnectionStatusIndicator";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export interface ConnectionProps {
  readyState: ReadyState;
  currentSocketUrl: string;
  socketUrlChangedCallback: (url: string) => void;
}

export const Connection = ({
  readyState,
  currentSocketUrl,
  socketUrlChangedCallback,
}: ConnectionProps) => {
  const [inputSocketUrl, setInputSocketUrl] =
    useState<string>(currentSocketUrl);
  console.log("Trying to connect to ", currentSocketUrl);

  return (
    <React.Fragment>
      <div className="flex items-center mb-3 gap-2">
        <h1 className="text-base font-bold">Connection</h1>
        <ConnectionStatusIndicator readyState={readyState} />
      </div>
      <div className="flex gap-1">
        <TextField
          id="wsUrl"
          label="Websocket URL"
          size="small"
          variant="outlined"
          onChange={(e) => setInputSocketUrl(e.target.value)}
          value={inputSocketUrl}
        />
        <Button
          variant="contained"
          name="setWsUrl"
          size="small"
          onClick={() => socketUrlChangedCallback(inputSocketUrl)}
          className="bg-[#FDBF79] text-black font-bold border-none hover:bg-[#fda94d]"
        >
          Connect
        </Button>
      </div>
    </React.Fragment>
  );
};
