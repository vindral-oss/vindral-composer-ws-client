import { useState } from "react";
import { WebsocketMessage } from "./WebsocketMessage";
import {
  Box,
  FormControlLabel,
  InputAdornment,
  Paper,
  Switch,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";

export interface MessageHistoryProps {
  messages: MessageEvent<unknown>[];
  lastMessage: MessageEvent<unknown> | null;
}

export const MessageHistory = ({ messages, lastMessage, noAccordion }: MessageHistoryProps & { noAccordion?: boolean }) => {
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [maxMessages, setMaxMessages] = useState<number>(100);
  const [filter, setFilter] = useState<string>("");
  // If noAccordion is true, just render the contents
  if (noAccordion) {
    return (
      <Box component="section" className="text-wrap break-words">
        <div className="sticky top-0 mb-2 bg-white z-10 border-b pb-2 border-gray-200 shadow-md">
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
                  max: 1000,
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
  }
  // ...existing code (original Accordion rendering)...
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Box component="section" className="text-wrap break-words">
      <Accordion expanded={open} onChange={(_, isOpen) => setOpen(isOpen)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <h2 className="text-base font-bold mb-3">Messages</h2>
        </AccordionSummary>
        <AccordionDetails>
          <div className="sticky top-0 mb-2 bg-white z-10 border-b pb-2 border-gray-200 shadow-md">
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
                    max: 1000,
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
            {open && messages
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
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export const MemoizedMessageHistory = React.memo(MessageHistory);
