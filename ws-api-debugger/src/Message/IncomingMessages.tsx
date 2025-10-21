import React, { useState, useEffect, useCallback } from "react";
import { MessageHistory } from "./MessageHistory";

interface IncomingMessagesProps {
  paused: boolean;
  setPaused: (value: boolean) => void;
  isSubscribed: boolean;
  registerHandler: (handler: (event: MessageEvent) => void) => void;
}

const IncomingMessages: React.FC<IncomingMessagesProps> = React.memo(
  ({ paused, setPaused, isSubscribed, registerHandler }) => {
    const [messages, setMessages] = useState<MessageEvent[]>([]);
    const [buffer, setBuffer] = useState<MessageEvent[]>([]);

    // Handler only pushes to buffer
    // Memoize handler with stable reference
    const handler = useCallback((event: MessageEvent) => {
      setBuffer((prev) => {
        const next = [event, ...prev];
        return next.length > 100 ? next.slice(0, 100) : next;
      });
    }, []);

    useEffect(() => {
      registerHandler(handler);
      return () => {
        registerHandler(() => {});
      };
    }, [registerHandler, handler]);

    // When not paused, flush buffer into messages
    useEffect(() => {
      if (!paused && buffer.length > 0) {
        setMessages((prev) => {
          const next = [...buffer, ...prev];
          return next.length > 100 ? next.slice(0, 100) : next;
        });
        setBuffer([]);
      }
    }, [paused, buffer]);

    const clearMessages = useCallback(() => setMessages([]), []);

    return (
      <div className="flex flex-col h-full min-h-0 px-6 border-r border-gray-300">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Incoming
        </h2>
        <div className="flex-1 min-h-0 flex ">
          <MessageHistory
            clearMessages={clearMessages}
            messages={messages}
            paused={paused}
            setPaused={setPaused}
            isSubscribed={isSubscribed}
          />
        </div>
      </div>
    );
  }
);

export default IncomingMessages;
