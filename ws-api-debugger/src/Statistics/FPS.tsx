import { useState, useEffect, useRef } from "react";
import { Typography, Box } from "@mui/material";

export function FPS() {
  const [fps, setFps] = useState<number>(0);

  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

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

  return (
    <Box className="text-center">
      <Typography variant="body2" color="text.secondary" className="text-xs">
        FPS
      </Typography>
      <Typography variant="h6" className="font-mono text-sm">
        {fps}
      </Typography>
    </Box>
  );
}
