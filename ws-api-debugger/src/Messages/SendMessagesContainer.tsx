import { useCallback } from "react";
import { SendMessage, type Message } from "./SendMessage";
import {
  useConnectionContext,
  useAudioContext,
} from "../context/useSpecializedContexts";

interface SendMessagesContainerProps {
  onSendMessage: (message: Message) => void;
}

export function SendMessagesContainer({
  onSendMessage,
}: SendMessagesContainerProps) {
  const { audioStrips, sendResetKey } = useAudioContext();
  const { isConnected } = useConnectionContext();

  const handleSendMessage = useCallback(
    (message: Message) => {
      if (isConnected) {
        onSendMessage(message);
      }
    },
    [isConnected, onSendMessage]
  );

  return (
    <div className="flex flex-col h-full min-h-0 pr-6 border-r border-gray-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Send
      </h2>
      <div className="flex-1 min-h-0">
        <SendMessage
          sendMessageFn={handleSendMessage}
          audioStrips={audioStrips || []}
          resetKey={sendResetKey}
        />
      </div>
    </div>
  );
}
