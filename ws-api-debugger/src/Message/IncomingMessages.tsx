import React, { useState, useEffect, useCallback, useRef } from "react";
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
    const bufferRef = useRef<MessageEvent[]>([]);

    // Handler pushes to buffer when paused, directly to messages when not paused
    // Memoize handler with stable reference
    const handler = useCallback(
      (event: MessageEvent) => {
        if (paused) {
          const current = bufferRef.current;
          const next = [event, ...current];
          bufferRef.current = next.length > 1000 ? next.slice(0, 1000) : next;
        } else {
          setMessages((prev) => {
            const next = [event, ...prev];
            return next.length > 1000 ? next.slice(0, 1000) : next;
          });
        }
      },
      [paused]
    );

    useEffect(() => {
      registerHandler(handler);
      return () => {
        registerHandler(() => {});
      };
    }, [registerHandler, handler]);

    // When not paused, flush buffer into messages
    useEffect(() => {
      if (!paused) {
        const currentBuffer = bufferRef.current;
        if (currentBuffer.length > 0) {
          setMessages((prev) => {
            const next = [...currentBuffer, ...prev];
            return next.length > 1000 ? next.slice(0, 1000) : next;
          });
          bufferRef.current = [];
        }
      }
    }, [paused]);

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
  },
  (prevProps, nextProps) => {
    const propsEqual =
      prevProps.paused === nextProps.paused &&
      prevProps.isSubscribed === nextProps.isSubscribed &&
      prevProps.setPaused === nextProps.setPaused &&
      prevProps.registerHandler === nextProps.registerHandler;

    return propsEqual;
  }
);

export default IncomingMessages;
