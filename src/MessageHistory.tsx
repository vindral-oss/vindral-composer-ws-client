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

export interface MessageHistoryProps {
  messages: MessageEvent<unknown>[];
  lastMessage: MessageEvent<unknown> | null;
}

export const MessageHistory = ({ messages }: MessageHistoryProps) => {
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [maxMessages, setMaxMessages] = useState<number>(100);
  return (
    <Box component="section" className="text-wrap break-words">
      <h2 className="text-3xl">Messages</h2>
      <FormControlLabel
        control={<Switch />}
        checked={prettyPrint}
        onChange={() => {
          setPrettyPrint(!prettyPrint);
        }}
        label="Pretty print"
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
        }}
        label="Message history"
        onChange={(e) => setMaxMessages(Number.parseInt(e.target.value))}
      />
      <div className="overflow-y-auto max-h-[calc(63vh-80px)] px-1">
        {messages.slice(0, maxMessages).map((message, idx) => (
          <Paper className="my-2" elevation={3} key={idx}>
            <WebsocketMessage message={message} prettyPrint={prettyPrint} />
          </Paper>
        ))}
      </div>
    </Box>
  );
};
