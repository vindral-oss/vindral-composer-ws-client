import { useCallback, useState, useMemo } from "react";
import useWebSocket from "react-use-websocket-lite";
import { Connection } from "./Connection/Connection";
import IncomingMessages from "./Message/IncomingMessages";
import OutgoingMessages from "./Message/OutgoingMessages";
import { type Message } from "./Message/SendMessage";
import { SendColumn } from "./Message/SendColumn";
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
  const [urlError, setUrlError] = useState<string>("");
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    Subscription[]
  >([]);
  const [pausedIncoming, setPausedIncoming] = useState<boolean>(false);
  const [pausedOutgoing, setPausedOutgoing] = useState<boolean>(false);
  const [sendResetKey, setSendResetKey] = useState(0);

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
      const win = window as unknown as {
        handleIncomingMessage?: (event: MessageEvent) => void;
      };
      if (win.handleIncomingMessage) {
        win.handleIncomingMessage(event);
      }
      const parsedJson = JSON.parse(event.data);
      // Unsubscribe handling
      if (parsedJson.Content === "unsubscribed from audio mixer") {
        setActiveSubscriptions([]);
        setAudioStrips([]);
        setPausedIncoming(false);
        setPausedOutgoing(false);
        setSendResetKey((prev) => prev + 1); // trigger SendMessage reset
      }
      // Audio mixer summary contains all available properties for that channel
      else if (parsedJson.Type === "AudioMixerSummary") {
        const newStrips = extractAudioStrips(event.data);
        setAudioStrips((prev) => {
          // Only update if contents actually changed
          if (JSON.stringify(prev) !== JSON.stringify(newStrips)) {
            return newStrips;
          }
          return prev;
        });
        const subscriptionName = parsedJson.Content;
        setActiveSubscriptions((prev) => {
          // Avoid duplicates
          if (prev.some((sub) => sub.Name === subscriptionName)) {
            return prev;
          }
          return [...prev, { Name: subscriptionName }];
        });
        setSendResetKey((prev) => prev + 1); // trigger SendMessage reset
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
      const win = window as unknown as {
        handleOutgoingMessage?: (event: MessageEvent) => void;
      };
      if (win.handleOutgoingMessage) {
        win.handleOutgoingMessage(messageEvent);
      }
      sendMessage(JSON.stringify(message));
    },
    [sendMessage] // Only changes if sendMessage changes
  );

  const handleUnsubscribe = (name: string) => {
    const message = { Type: "Unsubscribe", Content: name };
    handleSendMessage(message);
    setSendResetKey((prev) => prev + 1); // trigger SendMessage reset
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
    setSendResetKey((prev) => prev + 1); // trigger SendMessage reset
  };

  // Memoized handler registration functions
  const registerIncomingHandler = useCallback(
    (handler: (event: MessageEvent) => void) => {
      (
        window as unknown as {
          handleIncomingMessage?: (event: MessageEvent) => void;
        }
      ).handleIncomingMessage = handler;
    },
    []
  );

  const registerOutgoingHandler = useCallback(
    (handler: (event: MessageEvent) => void) => {
      (
        window as unknown as {
          handleOutgoingMessage?: (event: MessageEvent) => void;
        }
      ).handleOutgoingMessage = handler;
    },
    []
  );

  // Memoize audioStrips so SendMessage only rerenders when audioStrips change
  const memoizedAudioStrips = useMemo(() => audioStrips || [], [audioStrips]);
  const memoizedSendMessageFn = useCallback(
    (message: Message) => handleSendMessage(message),
    [handleSendMessage]
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
        {/* Column 1 - Send */}
        <SendColumn
          audioStrips={memoizedAudioStrips}
          sendMessageFn={memoizedSendMessageFn}
          resetKey={sendResetKey}
        />

        {/* Column 2 - Incoming */}
        <IncomingMessages
          paused={pausedIncoming}
          setPaused={setPausedIncoming}
          isSubscribed={activeSubscriptions.length > 0}
          registerHandler={registerIncomingHandler}
        />

        {/* Column 3 - Outgoing */}
        <OutgoingMessages
          paused={pausedOutgoing}
          setPaused={setPausedOutgoing}
          isSubscribed={activeSubscriptions.length > 0}
          registerHandler={registerOutgoingHandler}
        />
      </div>
    </div>
  );
}
