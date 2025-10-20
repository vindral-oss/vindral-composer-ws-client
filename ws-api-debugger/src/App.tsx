import { useCallback, useState } from "react";
import useWebSocket from "react-use-websocket-lite";
import { Connection } from "./Connection/Connection";
import { MessageHistory } from "./Message/MessageHistory";
import { SendMessage, type Message } from "./Message/SendMessage";
import { SubscribeContainer, type Subscription } from "./Message/Subscribe";
import { Card, CardContent } from "@mui/material";

export type ComposerProperty = {
  PropertyDescription: string;
  PropertyName: string;
  PropertyType: string;
  CanWrite: boolean;
  Value: number | string;
  ValueEnum?: "string";
};
export interface ComposerAudioObject {
  Id: string;
  Name: string;
  Properties: ComposerProperty[];
  SortOrder: number;
  Type: string;
  SelectedProperty?: string;
}

/** Extract audio strips from the WebSocket response
 *
 * The response data is a stringified JSON object with a Content field
 * that is itself a stringified JSON object containing the audio strips.
 *
 * (Composer might send other types of content, so we need to parse accordingly.)
 */
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
  const [sentMessageHistory, setSentMessageHistory] = useState<MessageEvent[]>(
    []
  );
  const [urlError, setUrlError] = useState<string>("");
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    Subscription[]
  >([]);
  const [pausedIncoming, setPausedIncoming] = useState<boolean>(false);
  const [pausedOutgoing, setPausedOutgoing] = useState<boolean>(false);

  const { sendMessage, readyState } = useWebSocket({
    url: isConnected ? socketUrl : null,
    connect: isConnected,
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

    onMessage: (event) => {
      setMessageHistory((prev) => [event, ...prev]);

      const parsedJson = JSON.parse(event.data);

      // Unsubscribe handling
      if (parsedJson.Content === "unsubscribed from audio mixer") {
        setActiveSubscriptions([]);
        setAudioStrips([]);
        setPausedIncoming(false);
        setPausedOutgoing(false);
      }

      // Audio mixer summary contains all available properties for that channel
      else if (parsedJson.Type === "AudioMixerSummary") {
        setAudioStrips(extractAudioStrips(event.data));
        const subscriptionName = parsedJson.Content;
        setActiveSubscriptions((prev) => {
          // Avoid duplicates
          if (prev.some((sub) => sub.Name === subscriptionName)) {
            return prev;
          }
          return [...prev, { Name: subscriptionName }];
        });
      } else if (
        parsedJson.Content ===
        "Composer project cleared. Removing all subscribers."
      ) {
        handleUnsubscribe("AudioMixer");
      }
    },

    onClose: () => {
      setAudioStrips([]);
      setIsConnected(false);
    },
  });

  const handleConnect = useCallback(
    (url: string) => {
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

  const handleUnsubscribe = (name: string) => {
    const message = { Type: "Unsubscribe", Content: name };
    handleSendMessage(message);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    handleUnsubscribe("AudioMixer");
    setActiveSubscriptions([]);
    setUrlError("");
  };

  const handleSubscribe = (name: string) => {
    const message = { Type: "Subscribe", Content: name };
    handleSendMessage(message);
  };

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
        {/* Column 1 - Send */}
        <div className="flex flex-col h-full min-h-0 pr-6 border-r border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Send
          </h2>
          <div className="flex-1 min-h-0">
            <SendMessage
              sendMessageFn={handleSendMessage}
              audioStrips={audioStrips || []}
              resetKey={
                activeSubscriptions.length +
                "-" +
                (audioStrips ? audioStrips.length : 0)
              }
            />
          </div>
        </div>

        {/* Column 2 - Incoming */}
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
              isSubscribed={activeSubscriptions.length > 0}
            />
          </div>
        </div>

        {/* Column 3 - Outgoing */}
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
              isSubscribed={activeSubscriptions.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
