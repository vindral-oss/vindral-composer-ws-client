import { useState, useEffect, useRef } from "react";
import { Typography, Box } from "@mui/material";

interface TransferAverageProps {
  messageCount: number;
}

export function TransferAverage({ messageCount }: TransferAverageProps) {
  const [messagesPerSecond, setMessagesPerSecond] = useState<number>(0);

  const lastMessageCountRef = useRef<number>(0);
  const currentMessageCountRef = useRef<number>(0);
  const messageRateIntervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    currentMessageCountRef.current = messageCount;
  }, [messageCount]);

  useEffect(() => {
    messageRateIntervalRef.current = window.setInterval(() => {
      const currentCount = currentMessageCountRef.current;
      const previousCount = lastMessageCountRef.current;
      const rate = currentCount - previousCount;

      setMessagesPerSecond(rate);
      lastMessageCountRef.current = currentCount;
    }, 1000);

    return () => {
      if (messageRateIntervalRef.current) {
        window.clearInterval(messageRateIntervalRef.current);
      }
    };
  }, []);

  return (
    <Box className="text-center">
      <Typography variant="body2" color="text.secondary" className="text-xs">
        Messages
      </Typography>
      <Typography variant="h6" className="font-mono text-sm">
        {messageCount} ({messagesPerSecond}/s)
      </Typography>
    </Box>
  );
}
