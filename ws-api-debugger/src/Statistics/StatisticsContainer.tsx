import { useState, useEffect, useRef } from "react";
import {
  useMessagesContext,
  useComposerContext,
} from "../context/useSpecializedContexts";
import { Box, Typography } from "@mui/material";

export function StatisticsContainer() {
  const { totalMessageCount } = useMessagesContext();
  const { composerVersion, projectName } = useComposerContext();

  // FPS tracking (inline implementation)
  const [fps, setFps] = useState<number>(0);
  const [messagesPerSecond, setMessagesPerSecond] = useState<number>(0);

  // FPS tracking
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // Message rate tracking
  const lastMessageCountRef = useRef<number>(0);
  const currentMessageCountRef = useRef<number>(0);
  const messageRateIntervalRef = useRef<number | undefined>(undefined);

  // Track FPS using requestAnimationFrame
  useEffect(() => {
    const measureFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        const currentFPS = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFPS);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameRef.current = requestAnimationFrame(measureFPS);
    };

    frameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Update current message count ref when prop changes
  useEffect(() => {
    currentMessageCountRef.current = totalMessageCount;
  }, [totalMessageCount]);

  // Track message rate
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
    <Box className="min-w-fit">
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
        Statistics
      </Typography>
      <Box className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        <Box>
          <Typography className="text-xs font-medium">
            <strong>FPS:</strong> <span className="font-mono">{fps}</span>
          </Typography>
        </Box>

        <Box>
          <Typography className="text-xs font-medium">
            <strong>Messages:</strong>{" "}
            <span className="font-mono">
              {`${totalMessageCount} (${messagesPerSecond} msgs/s)`}
            </span>
          </Typography>
        </Box>

        <Box>
          <Typography className="text-xs font-medium">
            <strong>Composer version:</strong> {composerVersion || "N/A"}
          </Typography>
        </Box>

        <Box>
          <Typography className="text-xs font-medium">
            <strong>Project:</strong> {projectName || "N/A"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
