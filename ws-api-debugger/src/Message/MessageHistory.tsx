import { useState } from "react";
import { Box } from "@mui/material";
import { MessageControl } from "./MessageControl";
import { WebsocketMessage } from "./WebsocketMessage";

export interface MessageHistoryProps {
  messages: MessageEvent<string>[];
  clearMessages: () => void;
  paused: boolean;
  setPaused: (value: boolean) => void;
  isSubscribed?: boolean;
}

export const MessageHistory = ({
  messages,
  clearMessages,
  paused,
  setPaused,
  isSubscribed = true,
}: MessageHistoryProps) => {
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [maxMessages, setMaxMessages] = useState<number>(20);
  const [filter, setFilter] = useState<string>("");

  // Custom clear function that clears parent messages
  const handleClearMessages = () => {
    clearMessages();
  };

  const slicedMessages =
    messages.length > maxMessages ? messages.slice(0, maxMessages) : messages;
  const filteredMessages = !filter
    ? slicedMessages
    : slicedMessages.filter((message) => {
        const dataStr = message.data;
        return dataStr.toLowerCase().includes(filter.toLowerCase());
      });

  return (
    <Box
      component="section"
      className="flex flex-col w-full h-full min-h-0 text-wrap break-words"
      sx={{ height: "100%" }}
    >
      <div className="sticky top-0 bg-white z-10 pb-2">
        <div className="flex flex-wrap gap-2 items-center w-full">
          <MessageControl
            prettyPrint={prettyPrint}
            setPrettyPrint={setPrettyPrint}
            filter={filter}
            setFilter={setFilter}
            maxMessages={maxMessages}
            setMaxMessages={setMaxMessages}
            clearMessages={handleClearMessages}
            paused={paused}
            setPaused={setPaused}
            queuedCount={
              paused ? Math.max(0, messages.length - maxMessages) : 0
            }
            clearDisabled={messages.length === 0}
            pauseDisabled={!isSubscribed}
          />
        </div>
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
