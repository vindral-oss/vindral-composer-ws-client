import { useState } from "react";
import { WebsocketMessage } from "./WebsocketMessage";
import {
  Box,
  FormControlLabel,
  InputAdornment,
  Paper,
  Switch,
  TextField,
} from "@mui/material";
import React from "react";

export interface MessageHistoryProps {
  messages: MessageEvent<unknown>[];
  lastMessage: MessageEvent<unknown> | null;
}

export const MessageHistory = ({ messages }: MessageHistoryProps) => {
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [maxMessages, setMaxMessages] = useState<number>(20);
  const [filter, setFilter] = useState<string>("");

  const messageList = (
    <Box component="section" className="text-wrap break-words">
      <div className="sticky top-0 mb-2 bg-white z-10 border-b pb-2 border-gray-200 shadow-md">
        <h2 className="text-base font-bold mb-3">Messages</h2>

        <div className="grid grid-cols-5 gap-x-2">
          <FormControlLabel
            control={<Switch />}
            checked={prettyPrint}
            onChange={() => {
              setPrettyPrint(!prettyPrint);
            }}
            label="Pretty"
            className="col-span-1"
          />
          <TextField
            type="text"
            value={filter}
            size="small"
            label="Filter messages"
            onChange={(e) => setFilter(e.target.value)}
            className="col-span-2"
          />
          <TextField
            type="number"
            value={maxMessages}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">max</InputAdornment>
                ),
              },
              htmlInput: {
                max: 200,
                min: 1,
              },
            }}
            label="Message history"
            onChange={(e) => setMaxMessages(Number.parseInt(e.target.value))}
            className="col-span-2"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        {messages
          .filter((message) => {
            if (!filter) return true;
            try {
              return JSON.stringify(message.data)
                .toLowerCase()
                .includes(filter.toLowerCase());
            } catch {
              return false;
            }
          })
          .slice(0, maxMessages)
          .map((message, idx) => (
            <Paper className="my-2 text-xs" elevation={3} key={idx}>
              <WebsocketMessage message={message} prettyPrint={prettyPrint} />
            </Paper>
          ))}
      </div>
    </Box>
  );

  return (
    <Box component="section" className="text-wrap break-words">
      {messageList}
    </Box>
  );
};

export const MemoizedMessageHistory = React.memo(MessageHistory);
