import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { SendMessage } from "./SendMessage";
import { MemoizedMessageHistory } from "./MessageHistory";
import { ConnectionStatusIndicator } from "./Connection/ConnectionStatusIndicator";
import { Connection } from "./Connection/Connection";

// interface Message {
//   Type: string;
//   Content: string | ContentString;
// }

// interface ContentString {
//   ObjectId: string;
//   PropertyName: string;
//   Value: string | number;
// }

export interface ComposerAudioObject {
  Id: string;
  Name: string;
  Properties: ComposerProperty[];
  SortOrder: number;
  Type: string;
  SelectedProperty?: string;
}

export type ComposerProperty = {
  PropertyDescription: string;
  PropertyName: string;
  PropertyType: string;
  CanWrite: boolean;
  Value: number | string;
  ValueEnum?: "string";
};

// const subscribeMessage: Message = {
//   Type: "Subscribe",
//   Content: "audiomixer",
// };

// export interface UniqueSelection {
//   AudioStripName: string;
//   PropertyId: string;
//   PropertyName: string;
// }

const extractAudioStrips = (response: unknown): ComposerAudioObject[] => {
  const parsedContent = JSON.parse(response as string);
  const content = JSON.parse(parsedContent.Content);

  return Object.keys(content).map((k) => content[k])[0];
};

// const updatePropertyValue = (
//   content: ContentString,
//   audioStrips?: ComposerAudioObject[]
// ): ComposerAudioObject[] => {
//   const updatedAudioStrips =
//     audioStrips?.map((audioObject) => {
//       if (audioObject.Id === content.ObjectId) {
//         return {
//           ...audioObject,
//           Properties: [
//             ...audioObject.Properties.map((property) => {
//               if (property.PropertyName === content.PropertyName) {
//                 return { ...property, Value: content.Value };
//               }
//               return property;
//             }),
//           ],
//         };
//       }
//       return audioObject;
//     }) || [];

//   return updatedAudioStrips;
// };

const WS_URL = "ws://localhost:8081";

export default function App() {
  const [socketUrl, setSocketUrl] = useState(WS_URL);
  const [audioStrips, setAudioStrips] = useState<ComposerAudioObject[]>();
  const [messageHistory, setMessageHistory] = useState<MessageEvent[]>([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => false,
    onOpen: () => {
      // sendMessage(JSON.stringify(subscribeMessage));
    },

    onMessage: (message) => {
      const parsedJson = JSON.parse(message.data);
      if (parsedJson.Type === "AudioMixerSummary") {
        setAudioStrips(extractAudioStrips(message.data));
      }
    },
    onClose: () => {
      setMessageHistory([]);
      setAudioStrips([]);
      console.log("Connection is closed");
    },
  });

  useEffect(() => {
    if (lastMessage === null) {
      return;
    }

    setMessageHistory((prev) => [lastMessage, ...prev]);
  }, [lastMessage]);

  return (
    <div className="p-8">
      <Connection
        readyState={readyState}
        currentSocketUrl={socketUrl}
        socketUrlChangedCallback={(url) => setSocketUrl(url)}
      />
      <div className="mb-2">
        <SendMessage
          sendMessageFn={sendMessage}
          audioStrips={audioStrips || []}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <MemoizedMessageHistory
          messages={messageHistory}
          lastMessage={lastMessage}
        />
      </div>
    </div>
  );
}

/**
Connection to [ ws url ]
Subscribe to [Options] // Only AudioMixer for now
Send message by selecting audio strip and property, then supplying value
A template string (the message) is generated on the side
A pane to show the message history;
- Incoming
- Outgoing (sent)
- Filter
- Set maximum number of messages to keep
- Clear button
*/
