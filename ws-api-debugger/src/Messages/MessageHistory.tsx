import React, { useState, useMemo, useCallback, memo } from "react";
import { Box } from "@mui/material";
import { MessageControl } from "./MessageControl";
import { WebsocketMessage } from "./WebsocketMessage";
import { OptimizedWebsocketMessage } from "./OptimizedWebsocketMessage";
import type { ProcessedMessage } from "./messageUtils";

export interface MessageHistoryProps {
  messages: MessageEvent<string>[];
  clearMessages: () => void;
  paused: boolean;
  setPaused: (value: boolean) => void;
  isSubscribed?: boolean;
  processedMessages?: ProcessedMessage[];
}

const MessageList = memo(
  ({
    filteredMessages,
    processedMessages,
    prettyPrint,
  }: {
    filteredMessages: MessageEvent[];
    processedMessages?: ProcessedMessage[];
    prettyPrint: boolean;
  }) => {
    const maxDOMElements = 75;
    const visibleMessages =
      filteredMessages.length > maxDOMElements
        ? filteredMessages.slice(0, maxDOMElements)
        : filteredMessages;
    const visibleProcessed =
      processedMessages && processedMessages.length > maxDOMElements
        ? processedMessages.slice(0, maxDOMElements)
        : processedMessages;

    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-1">
        {visibleMessages.map((message, idx) => {
          const processedMessage = visibleProcessed?.[idx];
          const key =
            processedMessage?.key || `msg-${idx}-${message.data?.length || 0}`;

          return (
            <div
              className="py-2 text-xs border-b border-gray-200 last:border-b-0"
              key={key}
            >
              {processedMessage ? (
                <OptimizedWebsocketMessage
                  processedMessage={processedMessage}
                  prettyPrint={prettyPrint}
                />
              ) : (
                <WebsocketMessage message={message} prettyPrint={prettyPrint} />
              )}
            </div>
          );
        })}
        {filteredMessages.length > maxDOMElements && (
          <div className="py-2 text-xs text-orange-600 text-center border-t border-orange-200 bg-orange-50">
            Showing latest {maxDOMElements} of {filteredMessages.length}{" "}
            messages (for performance reasons)
            <br />
            <span className="text-xs">
              Filtering can still be done on all messages.
            </span>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.filteredMessages === nextProps.filteredMessages &&
      prevProps.prettyPrint === nextProps.prettyPrint &&
      prevProps.processedMessages === nextProps.processedMessages
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
    processedMessages,
  }: MessageHistoryProps) => {
    const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
    const [maxMessages, setMaxMessages] = useState<number>(10000);
    const [filter, setFilter] = useState<string>("");

    const handleClearMessages = useCallback(() => {
      clearMessages();
    }, [clearMessages]);

    const { filteredMessages, filteredProcessedMessages } = useMemo(() => {
      if (!filter) {
        const slicedMessages =
          messages.length > maxMessages
            ? messages.slice(0, maxMessages)
            : messages;

        const slicedProcessedMessages =
          processedMessages && processedMessages.length > maxMessages
            ? processedMessages.slice(0, maxMessages)
            : processedMessages;

        return {
          filteredMessages: slicedMessages,
          filteredProcessedMessages: slicedProcessedMessages,
        };
      } else {
        const lowerFilter = filter.toLowerCase();
        const allFilteredMessages = messages.filter((message) => {
          const dataStr = message.data;
          return dataStr.toLowerCase().includes(lowerFilter);
        });

        const allFilteredProcessed = processedMessages?.filter(
          (processedMsg) => {
            const dataStr = processedMsg.originalMessage.data;
            return dataStr.toLowerCase().includes(lowerFilter);
          }
        );

        const filteredMessages =
          allFilteredMessages.length > maxMessages
            ? allFilteredMessages.slice(0, maxMessages)
            : allFilteredMessages;

        const filteredProcessedMessages =
          allFilteredProcessed && allFilteredProcessed.length > maxMessages
            ? allFilteredProcessed.slice(0, maxMessages)
            : allFilteredProcessed;

        return {
          filteredMessages,
          filteredProcessedMessages,
        };
      }
    }, [messages, processedMessages, maxMessages, filter]);

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
          {filter && (
            <div className="py-2 text-xs text-blue-600 text-center border border-blue-200 bg-blue-50 rounded mt-2">
              Found {filteredMessages.length} message
              {filteredMessages.length !== 1 ? "s" : ""} with '{filter}' as
              filter
            </div>
          )}
        </div>
        <MessageList
          filteredMessages={filteredMessages}
          prettyPrint={prettyPrint}
          processedMessages={filteredProcessedMessages}
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
    const processedMessagesEqual =
      prevProps.processedMessages === nextProps.processedMessages;

    const propsEqual =
      messagesEqual &&
      clearMessagesEqual &&
      pausedEqual &&
      setPausedEqual &&
      isSubscribedEqual &&
      processedMessagesEqual;

    return propsEqual;
  }
);
