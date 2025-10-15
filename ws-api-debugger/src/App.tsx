import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Connection } from "./Connection/ConnectionContainer";
import { MemoizedMessageHistory } from "./Message/MessageHistory";
import { SendMessage } from "./Message/SendMessage";
import {
  SubscribeContainer,
  type Subscription,
} from "./Message/SubscribeContainer";
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
  const [isConnected, setIsConnected] = useState(false);
  const [audioStrips, setAudioStrips] = useState<ComposerAudioObject[]>();
  const [messageHistory, setMessageHistory] = useState<MessageEvent[]>([]);
  const [urlError, setUrlError] = useState<string>("");
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    Subscription[]
  >([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    isConnected ? socketUrl : null, // Only connect when isConnected is true
    {
      shouldReconnect: () => false,

      onOpen: () => {
        setUrlError("");
      },

      onError: (event) => {
        console.error("WebSocket error observed:", event);
        setUrlError(
          `Unable to connect to ${socketUrl}. Server not responding or unreachable.`
        );
        setIsConnected(false);
      },

      onMessage: (message) => {
        const parsedJson = JSON.parse(message.data);
        if (parsedJson.Type === "AudioMixerSummary") {
          setAudioStrips(extractAudioStrips(message.data));
        } else if (parsedJson.Type === "SubscriptionConfirmed") {
          const subscriptionName = parsedJson.Content;
          setActiveSubscriptions((prev) => {
            // Avoid duplicates
            if (prev.some((sub) => sub.Name === subscriptionName)) {
              return prev;
            }
            return [...prev, { Name: subscriptionName }];
          });
        }
      },

      onClose: () => {
        setMessageHistory([]);
        setAudioStrips([]);
        setIsConnected(false);
      },
    }
  );

  useEffect(() => {
    if (lastMessage === null) {
      return;
    }

    setMessageHistory((prev) => [lastMessage, ...prev]);
  }, [lastMessage]);

  const handleConnect = useCallback(
    (url: string) => {
      // Validate WebSocket URL with regex
      const wsUrlRegex =
        /^(wss?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^/]+):([0-9]{1,5})$/;

      if (!wsUrlRegex.test(url.trim())) {
        setUrlError(
          "Invalid WebSocket URL format. Expected: ws://hostname:port or wss://hostname:port"
        );
        setIsConnected(false); // Ensure we're in disconnected state
        return;
      }

      // Validate port range
      const portMatch = url.match(/:([0-9]{1,5})$/);
      if (portMatch) {
        const port = parseInt(portMatch[1]);
        if (port < 1 || port > 65535) {
          setUrlError("Port must be between 1 and 65535");
          setIsConnected(false); // Ensure we're in disconnected state
          return;
        }
      }

      // Clear any previous error and connect
      setUrlError("");

      // If we're trying to connect to the same URL, we need to force a reconnection
      // by briefly disconnecting and then reconnecting
      if (socketUrl === url.trim() && isConnected) {
        setIsConnected(false);
        // Use setTimeout to ensure the disconnection is processed before reconnecting
        setTimeout(() => {
          setSocketUrl(url.trim());
          setIsConnected(true);
        }, 10);
      } else {
        setSocketUrl(url.trim());
        setIsConnected(true);
      }
    },
    [socketUrl, isConnected]
  );

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setUrlError(""); // Clear any URL errors when disconnecting
  }, []);

  const handleSubscribe = useCallback(
    (name: string) => {
      const message = { Type: "Subscribe", Content: name };
      sendMessage(JSON.stringify(message));
    },
    [sendMessage]
  );

  return (
    <div className="p-6">
      <Connection
        readyState={readyState}
        currentSocketUrl={socketUrl}
        isConnected={isConnected}
        urlError={urlError}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <SubscribeContainer
        activeSubscriptions={activeSubscriptions}
        onSubscribe={handleSubscribe}
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
