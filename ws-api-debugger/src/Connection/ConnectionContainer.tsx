import { useCallback } from "react";
import { useConnectionContext } from "../context/useSpecializedContexts";
import { ConnectionInput } from "./ConnectionInput";

export function ConnectionContainer() {
  const {
    socketUrl,
    setSocketUrl,
    isConnected,
    setIsConnected,
    urlError,
    setUrlError,
    readyState,
  } = useConnectionContext();

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
    [socketUrl, isConnected, setIsConnected, setSocketUrl, setUrlError]
  );

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setUrlError("");
  }, [setIsConnected, setUrlError]);

  return (
    <ConnectionInput
      readyState={readyState}
      currentSocketUrl={socketUrl}
      isConnected={isConnected}
      urlError={urlError}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
    />
  );
}
