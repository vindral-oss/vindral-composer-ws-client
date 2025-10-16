import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { MessageControl } from "./MessageControl";
import { WebsocketMessage } from "./WebsocketMessage";

export interface MessageHistoryProps {
  messages: MessageEvent<unknown>[];
  clearMessages: () => void;
  paused: boolean;
  setPaused: (value: boolean) => void;
}

export const MessageHistory = ({
  messages,
  clearMessages,
  paused,
  setPaused,
}: MessageHistoryProps) => {
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [maxMessages, setMaxMessages] = useState<number>(20);
  const [filter, setFilter] = useState<string>("");
  const [renderedMessages, setRenderedMessages] =
    useState<MessageEvent<unknown>[]>(messages);

  useEffect(() => {
    if (!paused) {
      setRenderedMessages(messages);
    }
    // If paused, do not update renderedMessages
  }, [messages, paused]);

  const filteredMessages = renderedMessages
    .filter((message) => {
      if (!filter) return true;
      const dataStr =
        typeof message.data === "string"
          ? message.data
          : typeof message.data === "number"
          ? message.data.toString()
          : typeof message.data === "object" && message.data !== null
          ? JSON.stringify(message.data)
          : "";
      return dataStr.toLowerCase().includes(filter.toLowerCase());
    })
    .slice(0, maxMessages);

  return (
    <Box
      component="section"
      className="flex flex-col w-full h-full min-h-0 text-wrap break-words"
      sx={{ height: "100%" }}
    >
      <div className="sticky top-0 bg-white z-10 pb-2">
        <MessageControl
          prettyPrint={prettyPrint}
          setPrettyPrint={setPrettyPrint}
          filter={filter}
          setFilter={setFilter}
          maxMessages={maxMessages}
          setMaxMessages={setMaxMessages}
          clearMessages={clearMessages}
          paused={paused}
          setPaused={setPaused}
          queuedCount={paused ? messages.length - renderedMessages.length : 0}
          clearDisabled={paused}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-1">
        {filteredMessages.map((message, idx) => (
          <div
            className="py-2 text-xs border-b border-gray-200 last:border-b-0"
            key={idx}
          >
            <WebsocketMessage message={message} prettyPrint={prettyPrint} />
          </div>
        ))}
      </div>
    </Box>
  );
};
