import { PlayArrow, Stop } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import type { Subscription } from "../types";

export interface SubscribeInputProps {
  activeSubscriptions: Subscription[];
  isConnected: boolean;
  onSubscribe: (name: string) => void;
  onUnsubscribe: (name: string) => void;
}

const availableSubscriptions: Subscription[] = [{ Name: "AudioMixer" }];

export const SubscribeInput = ({
  activeSubscriptions,
  isConnected,
  onSubscribe,
  onUnsubscribe,
}: SubscribeInputProps) => {
  const [subscriptionName, setSubscriptionName] =
    useState<string>("AudioMixer");

  const isSubscribed = activeSubscriptions.length > 0;

  return (
    <div>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Subscribe
          </Typography>
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} alignItems="flex-start">
        <FormControl
          sx={{
            margin: "",
          }}
          fullWidth
          className="text-xs"
        >
          <InputLabel id="audio-strip-label" className="text-xs">
            Name
          </InputLabel>
          <Select
            labelId="audio-strip-label"
            id="audio-strip"
            size="small"
            value={subscriptionName}
            label="Audio strip"
            onChange={(e) => {
              setSubscriptionName(e.target.value);
            }}
          >
            {availableSubscriptions?.map((subscription: Subscription) => (
              <MenuItem
                key={subscription.Name}
                value={subscription.Name}
                className="text-xs"
              >
                {subscription.Name}
              </MenuItem>
            ))}
            <MenuItem
              disabled
              className="text-xs"
              sx={{ fontStyle: "italic", color: "text.secondary" }}
            >
              More coming soon...
            </MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="medium"
          startIcon={isSubscribed ? <Stop /> : <PlayArrow />}
          onClick={() => {
            if (isSubscribed) {
              // Not implemented in Composer yet.
              onUnsubscribe(subscriptionName);
            } else {
              onSubscribe(subscriptionName);
            }
          }}
          color={isSubscribed ? "error" : "primary"}
          sx={{
            minWidth: 140,
            fontWeight: 600,
            textTransform: "none",
          }}
          disabled={!isConnected}
        >
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
      </Stack>
    </div>
  );
};
