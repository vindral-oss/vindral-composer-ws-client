import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { MessageHistory } from "./MessageHistory";
import {
  useMessagesContext,
  useSubscriptionsContext,
} from "../context/useSpecializedContexts";
import { processMessage, type ProcessedMessage } from "./messageUtils";

interface IncomingMessagesProps {
  registerHandler: (handler: (event: MessageEvent) => void) => void;
}

const IncomingMessages: React.FC<IncomingMessagesProps> = React.memo(
  ({ registerHandler }) => {
    const {
      pausedIncoming: paused,
      setPausedIncoming: setPaused,
      incrementMessageCount,
    } = useMessagesContext();
    const { activeSubscriptions } = useSubscriptionsContext();
    const isSubscribed = activeSubscriptions.length > 0;
    const [processedMessages, setProcessedMessages] = useState<
      ProcessedMessage[]
    >([]);
    const bufferRef = useRef<ProcessedMessage[]>([]);
    const pendingUpdatesRef = useRef<ProcessedMessage[]>([]);
    const batchTimeoutRef = useRef<number | null>(null);

    const flushPendingUpdates = useCallback(() => {
      if (pendingUpdatesRef.current.length > 0) {
        const updates = pendingUpdatesRef.current;
        pendingUpdatesRef.current = [];

        setProcessedMessages((prev) => {
          const combined = [...updates, ...prev];
          return combined.length > 10000 ? combined.slice(0, 10000) : combined;
        });
      }
      batchTimeoutRef.current = null;
    }, []);

    const handler = useCallback(
      (event: MessageEvent) => {
        incrementMessageCount();

        const lightweightMessage = {
          data: event.data,
          timeStamp: event.timeStamp || Date.now(),
          type: event.type,
        } as MessageEvent;

        const processed = processMessage(lightweightMessage);

        if (paused) {
          const current = bufferRef.current;
          const next = [processed, ...current];
          bufferRef.current = next.length > 10000 ? next.slice(0, 10000) : next;
        } else {
          pendingUpdatesRef.current.unshift(processed);

          if (batchTimeoutRef.current === null) {
            batchTimeoutRef.current =
              window.requestAnimationFrame(flushPendingUpdates);
          }
        }
      },
      [paused, incrementMessageCount, flushPendingUpdates]
    );

    useEffect(() => {
      registerHandler(handler);
      return () => {
        registerHandler(() => {});
        if (batchTimeoutRef.current !== null) {
          window.cancelAnimationFrame(batchTimeoutRef.current);
          batchTimeoutRef.current = null;
        }
      };
    }, [registerHandler, handler]);

    useEffect(() => {
      if (!paused) {
        const currentBuffer = bufferRef.current;
        if (currentBuffer.length > 0) {
          setProcessedMessages((prev) => {
            const next = [...currentBuffer, ...prev];
            return next.length > 10000 ? next.slice(0, 10000) : next;
          });
          bufferRef.current = [];
        }
      }
    }, [paused]);

    const clearMessages = useCallback(() => setProcessedMessages([]), []);

    const legacyMessages = useMemo(
      () => processedMessages.map((pm) => pm.originalMessage),
      [processedMessages]
    );

    return (
      <div className="flex flex-col h-full min-h-0 px-6 border-r border-gray-300">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Incoming
        </h2>
        <div className="flex-1 min-h-0 flex ">
          <MessageHistory
            clearMessages={clearMessages}
            messages={legacyMessages}
            paused={paused}
            setPaused={setPaused}
            isSubscribed={isSubscribed}
            processedMessages={processedMessages}
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
