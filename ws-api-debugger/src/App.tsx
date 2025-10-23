import { useCallback } from "react";
import { ConnectionContainer } from "./Connection/ConnectionContainer";
import { SubscribeContainer } from "./Subscribe/SubscribeContainer";
import { SendMessagesContainer } from "./Messages/SendMessagesContainer";
import { MessagesContainer } from "./Messages/MessagesContainer";
import { StatisticsContainer } from "./Statistics/StatisticsContainer";
import { Card, CardContent } from "@mui/material";
import { ConnectionProvider } from "./context/ConnectionContext";
import { AudioProvider } from "./context/AudioContext";
import { MessagesProvider } from "./context/MessagesContext";
import { SubscriptionsProvider } from "./context/SubscriptionsContext";
import { ComposerProvider } from "./context/ComposerContext";
import { useMessagesContext } from "./context/useSpecializedContexts";
import { WebSocketManager } from "./components/WebSocketManager";
import { getSendMessage } from "./utils/sendMessageUtils";
import { type Message } from "./Messages/SendMessage";

function AppContent() {
  const { handleOutgoingMessage } = useMessagesContext();

  const handleSendMessage = useCallback(
    (message: Message) => {
      const sendMessage = getSendMessage();
      if (sendMessage) {
        const messageEvent = new MessageEvent("message", {
          data: JSON.stringify({
            ...message,
            DateTime: new Date().toISOString(),
          }),
        });
        handleOutgoingMessage(messageEvent);
        // Convert message object to JSON string before sending
        sendMessage(JSON.stringify(message));
      }
    },
    [handleOutgoingMessage]
  );

  const handleSubscribe = useCallback(
    (name: string) => {
      const subscribeMessage = {
        Type: "Subscribe",
        Content: name,
      };
      handleSendMessage(subscribeMessage);
    },
    [handleSendMessage]
  );

  const handleUnsubscribe = useCallback(
    (name: string) => {
      const unsubscribeMessage = {
        Type: "Unsubscribe",
        Content: name,
      };
      handleSendMessage(unsubscribeMessage);
    },
    [handleSendMessage]
  );

  return (
    <div className="h-screen flex flex-col">
      <Card className="p-4" elevation={2}>
        <CardContent className="flex gap-x-8 items-center">
          <ConnectionContainer />
          <SubscribeContainer
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
          />
          <StatisticsContainer />
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-0 p-6 overflow-hidden">
        <SendMessagesContainer onSendMessage={handleSendMessage} />
        <MessagesContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConnectionProvider>
      <ComposerProvider>
        <MessagesProvider>
          <SubscriptionsProvider>
            <AudioProvider>
              <WebSocketManager />
              <AppContent />
            </AudioProvider>
          </SubscriptionsProvider>
        </MessagesProvider>
      </ComposerProvider>
    </ConnectionProvider>
  );
}
