import { useCallback } from "react";
import {
  useConnectionContext,
  useSubscriptionsContext,
} from "../context/useSpecializedContexts";
import { SubscribeInput } from "./SubscribeInput";

interface SubscribeContainerProps {
  onSubscribe: (name: string) => void;
  onUnsubscribe: (name: string) => void;
}

export function SubscribeContainer({
  onSubscribe,
  onUnsubscribe,
}: SubscribeContainerProps) {
  const { activeSubscriptions } = useSubscriptionsContext();
  const { isConnected } = useConnectionContext();

  const handleSubscribe = useCallback(
    (name: string) => {
      if (isConnected) {
        onSubscribe(name);
      }
    },
    [isConnected, onSubscribe]
  );

  const handleUnsubscribe = useCallback(
    (name: string) => {
      if (isConnected) {
        onUnsubscribe(name);
      }
    },
    [isConnected, onUnsubscribe]
  );

  return (
    <SubscribeInput
      activeSubscriptions={activeSubscriptions}
      isConnected={isConnected}
      onSubscribe={handleSubscribe}
      onUnsubscribe={handleUnsubscribe}
    />
  );
}
