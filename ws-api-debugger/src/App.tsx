import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Connection } from "./Connection/ConnectionContainer";
import { MessageHistory } from "./Message/MessageHistory";
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
        setIsConnected(false);
        return;
      }

      const portMatch = url.match(/:([0-9]{1,5})$/);
      if (portMatch) {
        const port = parseInt(portMatch[1]);
        if (port < 1 || port > 65535) {
          setUrlError("Port must be between 1 and 65535");
          setIsConnected(false);
          return;
        }
      }

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
    setUrlError("");
  }, []);

  const handleSubscribe = useCallback(
    (name: string) => {
      const message = { Type: "Subscribe", Content: name };
      sendMessage(JSON.stringify(message));
    },
    [sendMessage]
  );

  return (
    <div className="grid grid-cols-[400px_1fr] h-screen">
      {/* Left Pane - Settings */}
      <div className="h-full max-w-md p-6 space-y-6 overflow-y-auto bg-gray-50">
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
      </div>

      {/* Right Pane - Messages */}
      <div className="h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 text-center py-8 px-6 bg-white border-b">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Messages</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time communication with your WebSocket server. Send messages
            and monitor all incoming and outgoing traffic.
          </p>
        </div>

        {/* 3-Column Content */}
        <div className="flex-1 grid grid-cols-3 gap-6 p-6">
          {/* Send Column */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Send
            </h2>
            <div className="flex-1">
              <SendMessage
                sendMessageFn={sendMessage}
                audioStrips={audioStrips || []}
              />
            </div>
          </div>

          {/* Incoming Column */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Incoming
            </h2>
            <div className="flex-1">
              <MessageHistory
                messages={messageHistory}
                lastMessage={lastMessage}
              />
            </div>
          </div>

          {/* Outgoing Column */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Outgoing
            </h2>
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-center px-4">
                Here we will put outgoing messages
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
