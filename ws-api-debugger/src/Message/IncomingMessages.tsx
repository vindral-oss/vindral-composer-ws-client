import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "../context/useAppContext";
import { MessageHistory } from "../Messages/MessageHistory";

interface IncomingMessagesProps {
  registerHandler: (handler: (event: MessageEvent) => void) => void;
}

const IncomingMessages: React.FC<IncomingMessagesProps> = React.memo(
  ({ registerHandler }) => {
    const {
      pausedIncoming: paused,
      setPausedIncoming: setPaused,
      activeSubscriptions,
      incrementMessageCount,
    } = useAppContext();
    const isSubscribed = activeSubscriptions.length > 0;
    const [messages, setMessages] = useState<MessageEvent[]>([]);
    const bufferRef = useRef<MessageEvent[]>([]);

    // Handler pushes to buffer when paused, directly to messages when not paused
    // Memoize handler with stable reference
    const handler = useCallback(
      (event: MessageEvent) => {
        // Always call the message received callback for statistics
        incrementMessageCount();

        const lightweightMessage = {
          data: event.data,
          timeStamp: event.timeStamp || Date.now(),
          type: event.type,
        } as MessageEvent;

        if (paused) {
          const current = bufferRef.current;
          const next = [lightweightMessage, ...current];
          bufferRef.current = next.length > 300 ? next.slice(0, 300) : next;
        } else {
          setMessages((prev) => {
            const next = [lightweightMessage, ...prev];
            return next.length > 300 ? next.slice(0, 300) : next;
          });
        }
      },
      [paused, incrementMessageCount]
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
            return next.length > 300 ? next.slice(0, 300) : next;
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
    return prevProps.registerHandler === nextProps.registerHandler;
  }
);

export default IncomingMessages;
