import { useEffect, useState } from "react";
import { ReadyState } from "react-use-websocket-lite";
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
} from "@mui/material";
import { Wifi, WifiOff } from "@mui/icons-material";
import { ConnectionStatus } from "./ConnectionStatus";

export interface ConnectionInputProps {
  readyState: ReadyState;
  currentSocketUrl: string;
  isConnected: boolean;
  urlError: string;
  onConnect: (url: string) => void;
  onDisconnect: () => void;
}

export const ConnectionInput = ({
  readyState,
  currentSocketUrl,
  isConnected,
  urlError,
  onConnect,
  onDisconnect,
}: ConnectionInputProps) => {
  const [inputSocketUrl, setInputSocketUrl] =
    useState<string>(currentSocketUrl);

  useEffect(() => {
    setInputSocketUrl(currentSocketUrl);
  }, [currentSocketUrl]);

  return (
    <div>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Connect
          </Typography>
          <ConnectionStatus readyState={readyState} />
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} alignItems="flex-start">
        <TextField
          id="wsUrl"
          label="WebSocket URL"
          variant="outlined"
          size="small"
          fullWidth
          disabled={isConnected}
          onChange={(e) => setInputSocketUrl(e.target.value)}
          value={inputSocketUrl}
        />
        <Button
          variant="contained"
          startIcon={isConnected ? <WifiOff /> : <Wifi />}
          onClick={() => {
            if (isConnected) {
              onDisconnect();
            } else {
              onConnect(inputSocketUrl);
            }
          }}
          color={isConnected ? "error" : "primary"}
          sx={{
            minWidth: 140,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </Stack>

      {urlError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {urlError}
        </Alert>
      )}
    </div>
  );
};
