import { useEffect } from "react";
import useWebSocket from "react-use-websocket-lite";
import {
  useConnectionContext,
  useAudioContext,
  useSubscriptionsContext,
  useMessagesContext,
  useComposerContext,
} from "../context/useSpecializedContexts";
import { setSendMessage } from "../utils/sendMessageUtils";
import type { ComposerAudioObject } from "../types";

const extractAudioStrips = (parsedJson: {
  Content: string;
}): ComposerAudioObject[] => {
  try {
    const content = JSON.parse(parsedJson.Content);

    if (
      content &&
      content.AudioMixerStrips &&
      Array.isArray(content.AudioMixerStrips)
    ) {
      const strips = content.AudioMixerStrips.map(
        (audioStrip: ComposerAudioObject, index: number) => ({
          ...audioStrip,
          Id: audioStrip.Id || `strip-${index}`,
          Name: audioStrip.Name || `Strip ${index + 1}`,
          Properties: audioStrip.Properties || [],
        })
      );

      return strips;
    }

    return [];
  } catch (error) {
    console.error("Failed to parse AudioMixerSummary content:", error);
    return [];
  }
};

export function WebSocketManager() {
  const { socketUrl, isConnected, setUrlError, setIsConnected, setReadyState } =
    useConnectionContext();
  const { audioStrips, setAudioStrips, incrementSendResetKey } =
    useAudioContext();
  const { activeSubscriptions, setActiveSubscriptions } =
    useSubscriptionsContext();
  const { setPausedIncoming, setPausedOutgoing, handleIncomingMessage } =
    useMessagesContext();
  const { setComposerInfo } = useComposerContext();

  const cleanup = () => {
    // Clear subscription state when connection is lost
    setActiveSubscriptions([]);
    setAudioStrips(undefined);
    setPausedIncoming(false);
    setPausedOutgoing(false);
    incrementSendResetKey();
  };
  const { sendMessage, readyState } = useWebSocket({
    url: isConnected ? socketUrl : null,
    connect: isConnected,
    onOpen: () => {
      setUrlError("");
    },

    onClose: () => {
      setIsConnected(false);
      cleanup();
    },

    onError: (event) => {
      console.error("WebSocket error observed:", event);
      setUrlError(
        `Unable to connect to ${socketUrl}. Server not responding or unreachable.`
      );
      setIsConnected(false);
      cleanup();
    },

    onMessage: (event) => {
      handleIncomingMessage(event);
      const parsedJson = JSON.parse(event.data);

      // Handle Welcome message to extract Composer information
      if (parsedJson.Type === "Welcome") {
        try {
          const welcomeContent = JSON.parse(parsedJson.Content);
          const projectPath = welcomeContent.ComposerProjectFullPathName || "";
          const projectName = projectPath
            ? projectPath.split("/").pop() || ""
            : "";

          setComposerInfo({
            composerVersion: welcomeContent.ComposerVersion || "",
            projectName: projectName,
            composerOS: welcomeContent.ComposerOS || "",
          });
        } catch (error) {
          console.error("Failed to parse Welcome message content:", error);
        }
      } else if (parsedJson.Content === "unsubscribed from audio mixer") {
        setActiveSubscriptions([]);
        setAudioStrips([]);
        setPausedIncoming(false);
        setPausedOutgoing(false);
        incrementSendResetKey();
      } else if (
        parsedJson.Content ===
        "Composer project cleared. Removing all subscribers."
      ) {
        // Handle project cleared - disconnect and reset all state
        setActiveSubscriptions([]);
        setAudioStrips([]);
        setPausedIncoming(false);
        setPausedOutgoing(false);
        incrementSendResetKey();
        setIsConnected(false);
      } else if (parsedJson.Type === "AudioMixerSummary") {
        const newStrips = extractAudioStrips(parsedJson);
        if (JSON.stringify(audioStrips) !== JSON.stringify(newStrips)) {
          setAudioStrips(newStrips);
        }
        const subscriptionName = parsedJson.Content;
        if (
          !activeSubscriptions.some(
            (sub: { Name: string }) => sub.Name === subscriptionName
          )
        ) {
          setActiveSubscriptions([
            ...activeSubscriptions,
            { Name: subscriptionName },
          ]);
        }
        incrementSendResetKey();
      }
    },
  });

  // Store sendMessage in global variable
  useEffect(() => {
    setSendMessage(sendMessage);
  }, [sendMessage]);

  useEffect(() => {
    setReadyState(readyState);
  }, [readyState, setReadyState]);

  return null;
}
