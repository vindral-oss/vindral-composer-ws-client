import React, { useState, useMemo, useCallback, memo } from "react";
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

// Separate memoized component for message list rendering
const MessageList = memo(
  ({
    filteredMessages,
    prettyPrint,
  }: {
    filteredMessages: MessageEvent<string>[];
    prettyPrint: boolean;
  }) => (
    <div className="flex-1 min-h-0 overflow-y-auto px-1">
      {filteredMessages.map((message, idx) => {
        // Use a simple, stable key without parsing JSON on every render
        const key = `msg-${idx}-${message.data?.length || 0}`;

        return (
          <div
            className="py-2 text-xs border-b border-gray-200 last:border-b-0"
            key={key}
          >
            <WebsocketMessage message={message} prettyPrint={prettyPrint} />
          </div>
        );
      })}
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.filteredMessages === nextProps.filteredMessages &&
      prevProps.prettyPrint === nextProps.prettyPrint
    );
  }
);

export const MessageHistory = React.memo(
  ({
    messages,
    clearMessages,
    paused,
    setPaused,
    isSubscribed = true,
  }: MessageHistoryProps) => {
    const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
    const [maxMessages, setMaxMessages] = useState<number>(25);
    const [filter, setFilter] = useState<string>("");

    // Custom clear function that clears parent messages
    const handleClearMessages = useCallback(() => {
      clearMessages();
    }, [clearMessages]);

    // Memoize expensive filtering operations
    const filteredMessages = useMemo(() => {
      const slicedMessages =
        messages.length > maxMessages
          ? messages.slice(0, maxMessages)
          : messages;

      if (!filter) {
        return slicedMessages;
      }

      const lowerFilter = filter.toLowerCase();
      return slicedMessages.filter((message) => {
        const dataStr = message.data;
        return dataStr.toLowerCase().includes(lowerFilter);
      });
    }, [messages, maxMessages, filter]);

    const messageControl = useMemo(
      () => (
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
          clearDisabled={messages.length === 0}
          pauseDisabled={!isSubscribed}
        />
      ),
      [
        prettyPrint,
        filter,
        maxMessages,
        paused,
        setPaused,
        messages.length,
        isSubscribed,
        handleClearMessages,
      ]
    );

    return (
      <Box
        component="section"
        className="flex flex-col w-full h-full min-h-0 text-wrap wrap-break-word"
        sx={{ height: "100%" }}
      >
        <div className="sticky top-0 bg-white z-10 pb-2">
          <div className="flex flex-wrap gap-2 items-center w-full">
            {messageControl}
          </div>
        </div>
        <MessageList
          filteredMessages={filteredMessages}
          prettyPrint={prettyPrint}
        />
      </Box>
    );
  },
  (prevProps, nextProps) => {
    const messagesEqual = prevProps.messages === nextProps.messages;
    const clearMessagesEqual =
      prevProps.clearMessages === nextProps.clearMessages;
    const pausedEqual = prevProps.paused === nextProps.paused;
    const setPausedEqual = prevProps.setPaused === nextProps.setPaused;
    const isSubscribedEqual = prevProps.isSubscribed === nextProps.isSubscribed;

    const propsEqual =
      messagesEqual &&
      clearMessagesEqual &&
      pausedEqual &&
      setPausedEqual &&
      isSubscribedEqual;

    return propsEqual;
  }
);
