import Box from "@mui/material/Box";
import { memo } from "react";
import type { ProcessedMessage } from "./messageUtils";

export interface OptimizedWebsocketMessageProps {
  processedMessage: ProcessedMessage;
  prettyPrint: boolean;
}

export const OptimizedWebsocketMessage = memo(
  ({ processedMessage, prettyPrint }: OptimizedWebsocketMessageProps) => {
    const { parsedData } = processedMessage;
    const { type, prettyTime, prettyContent } = parsedData;

    return (
      <Box
        component="section"
        className={`text-wrap p-2 wrap-break-word ${
          type === "Error" ? "bg-red-500" : "bg-white"
        }`}
      >
        {prettyPrint && (
          <div className="flex flex-wrap font-bold mb-4">
            <div className="font-bold mr-auto">{type}</div>
            <div className="justify-end">{prettyTime}</div>
          </div>
        )}
        <pre>
          {prettyPrint ? prettyContent : processedMessage.originalMessage.data}
        </pre>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    // Only rerender if the processed message key or prettyPrint changes
    return (
      prevProps.processedMessage.key === nextProps.processedMessage.key &&
      prevProps.prettyPrint === nextProps.prettyPrint
    );
  }
);
