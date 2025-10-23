import React, { useState, useEffect, useCallback, useRef } from "react";
import { MessageHistory } from "./MessageHistory";
import { useConnectionContext } from "../context/useSpecializedContexts";

interface OutgoingMessagesProps {
  registerHandler: (handler: (event: MessageEvent) => void) => void;
}

const OutgoingMessages: React.FC<OutgoingMessagesProps> = React.memo(
  ({ registerHandler }) => {
    const { isConnected } = useConnectionContext();
    const [paused, setPaused] = useState(false);
    const isSubscribed = isConnected;
    const [messages, setMessages] = useState<MessageEvent[]>([]);
    const bufferRef = useRef<MessageEvent[]>([]);

    const handler = useCallback(
      (event: MessageEvent) => {
        const lightweightMessage = {
          data: event.data,
          timeStamp: event.timeStamp || Date.now(),
          type: event.type,
        } as MessageEvent;

        if (paused) {
          const current = bufferRef.current;
          const next = [lightweightMessage, ...current];
          bufferRef.current = next.length > 10000 ? next.slice(0, 10000) : next;
        } else {
          setMessages((prev) => {
            const next = [lightweightMessage, ...prev];
            return next.length > 10000 ? next.slice(0, 10000) : next;
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

    useEffect(() => {
      if (!paused) {
        const currentBuffer = bufferRef.current;
        if (currentBuffer.length > 0) {
          setMessages((prev) => {
            const next = [...currentBuffer, ...prev];
            return next.length > 10000 ? next.slice(0, 10000) : next;
          });
          bufferRef.current = [];
        }
      }
    }, [paused]);

    const clearMessages = useCallback(() => setMessages([]), []);

    return (
      <div className="flex flex-col h-full min-h-0 pl-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Outgoing
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

export default OutgoingMessages;
