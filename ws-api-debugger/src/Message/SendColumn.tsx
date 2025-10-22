import { memo } from "react";
import { SendMessage, type Message } from "./SendMessage";
import { type ComposerAudioObject } from "../App";

interface SendColumnProps {
  audioStrips: ComposerAudioObject[];
  sendMessageFn: (message: Message) => void;
  resetKey: number;
}

export const SendColumn = memo(
  ({ audioStrips, sendMessageFn, resetKey }: SendColumnProps) => (
    <div className="flex flex-col h-full min-h-0 pr-6 border-r border-gray-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Send
      </h2>
      <div className="flex-1 min-h-0">
        <SendMessage
          sendMessageFn={sendMessageFn}
          audioStrips={audioStrips}
          resetKey={resetKey}
        />
      </div>
    </div>
  ),
  (prevProps, nextProps) => {
    // Only rerender if props actually change
    return (
      prevProps.audioStrips === nextProps.audioStrips &&
      prevProps.resetKey === nextProps.resetKey &&
      prevProps.sendMessageFn === nextProps.sendMessageFn
    );
  }
);
