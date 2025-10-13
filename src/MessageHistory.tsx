import Box from "@mui/material/Box";
import React from "react";
import { WebsocketMessage } from "./WebsocketMessage";

export interface MessageHistoryProps {
  messages: MessageEvent<any>[];
  lastMessage: MessageEvent<any> | null;
}

export const MessageHistory = ({ messages }: MessageHistoryProps) => (
  <Box component="section" className="text-wrap break-words">
    <h2 className="text-3xl">Messages</h2>
    <div className="overflow-y-auto max-h-[calc(85vh-64px)] [&>*:nth-child(odd)]:bg-gray-300 p-2">
      {messages.map((message, idx) => (
        <React.Fragment key={idx}>
          <WebsocketMessage message={message} />
        </React.Fragment>
      ))}
    </div>
  </Box>
);
