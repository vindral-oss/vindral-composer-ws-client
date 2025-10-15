import type { ReadyState } from "react-use-websocket";

export const ConnectionStatusIndicator = ({
  readyState,
}: {
  readyState: ReadyState;
}) => (
  <span
    title={
      readyState === 1
        ? "Connected"
        : readyState === 0
        ? "Connecting"
        : readyState === 2
        ? "Closing"
        : "Closed/Error"
    }
    className={
      "inline-block w-3 h-3 rounded-full border border-gray-300 " +
      (readyState === 1
        ? "bg-green-500"
        : readyState === 0
        ? "bg-yellow-400"
        : "bg-red-500")
    }
  ></span>
);
