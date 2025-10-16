import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Connection } from "./Connection/ConnectionContainer";
import { MessageHistory } from "./Message/MessageHistory";
import { SendMessage, type Message } from "./Message/SendMessage";
import {
  SubscribeContainer,
  type Subscription,
} from "./Message/SubscribeContainer";
import { Card, CardContent } from "@mui/material";

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

  console.log("Audio strips");
  console.log(content);
  return Object.keys(content).map((k) => content[k])[0];
};

const WS_URL = "ws://localhost:8081";

export default function App() {
  const [socketUrl, setSocketUrl] = useState(WS_URL);
  const [isConnected, setIsConnected] = useState(false);
  const [audioStrips, setAudioStrips] = useState<ComposerAudioObject[]>();
  const [messageHistory, setMessageHistory] = useState<MessageEvent[]>([]);
  const [sentMessageHistory, setSentMessageHistory] = useState<MessageEvent[]>(
    []
  );
  const [urlError, setUrlError] = useState<string>("");
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    Subscription[]
  >([]);
  // PAUSE state for incoming and outgoing
  const [pausedIncoming, setPausedIncoming] = useState<boolean>(false);
  const [pausedOutgoing, setPausedOutgoing] = useState<boolean>(false);

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
        if (parsedJson.Type === "PropertyChanged") {
          setMessageHistory((prev) => [message, ...prev]);
        } else if (parsedJson.Type === "AudioMixerSummary") {
          setAudioStrips(extractAudioStrips(message.data));
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
        // setMessageHistory([]);
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
    setActiveSubscriptions([]);
    setUrlError("");
  }, []);

  const handleSubscribe = (name: string) => {
    const message = { Type: "Subscribe", Content: name };
    handleSendMessage(message);
  };

  const handleUnsubscribe = (name: string) => {
    const message = { Type: "Unsubscribe", Content: name };
    handleSendMessage(message);
  };

  const handleSendMessage = useCallback(
    (message: Message) => {
      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({
          ...message,
          DateTime: new Date().toISOString(),
        }),
      });
      setSentMessageHistory((prev) => [messageEvent, ...prev]);
      sendMessage(JSON.stringify(message));
    },
    [sendMessage]
  );

  return (
    <div className="h-screen flex flex-col">
      <Card className="p-4" elevation={2}>
        <CardContent className="flex gap-x-8">
          <Connection
            readyState={readyState}
            currentSocketUrl={socketUrl}
            isConnected={isConnected}
            urlError={urlError}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <SubscribeContainer
            isConnected={isConnected}
            activeSubscriptions={activeSubscriptions}
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
          />
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-0 p-6 overflow-hidden">
        {/* Send Column */}
        <div className="flex flex-col h-full min-h-0 pr-6 border-r border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Send
          </h2>
          <div className="flex-1 min-h-0">
            <SendMessage
              sendMessageFn={handleSendMessage}
              audioStrips={audioStrips || []}
            />
          </div>
        </div>

        {/* Incoming Column */}
        <div className="flex flex-col h-full min-h-0 px-6 border-r border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Incoming
          </h2>
          <div className="flex-1 min-h-0 flex ">
            <MessageHistory
              clearMessages={() => setMessageHistory([])}
              messages={messageHistory}
              paused={pausedIncoming}
              setPaused={setPausedIncoming}
            />
          </div>
        </div>

        {/* Outgoing Column */}
        <div className="flex flex-col h-full min-h-0 pl-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Outgoing
          </h2>
          <div className="flex-1 min-h-0 flex ">
            <MessageHistory
              clearMessages={() => setSentMessageHistory([])}
              messages={sentMessageHistory}
              paused={pausedOutgoing}
              setPaused={setPausedOutgoing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
