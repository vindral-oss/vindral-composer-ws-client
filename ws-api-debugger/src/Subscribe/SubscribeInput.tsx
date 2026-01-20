import {
  Box,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import type { Subscription } from "../types";

export interface SubscribeInputProps {
  activeSubscriptions: Subscription[];
  isConnected: boolean;
  onSubscribe: (name: string) => void;
  onUnsubscribe: (name: string) => void;
}

const availableSubscriptions: Subscription[] = [
  { Name: "AudioMixer" },
  { Name: "LogFile" },
];

export const SubscribeInput = ({
  activeSubscriptions,
  isConnected,
  onSubscribe,
  onUnsubscribe,
}: SubscribeInputProps) => {
  const isSubscribed = (name: string) =>
    activeSubscriptions.some((sub) => sub.Name === name);

  const handleToggleSubscription = (name: string) => {
    if (!isConnected) return;
    
    if (isSubscribed(name)) {
      onUnsubscribe(name);
    } else {
      onSubscribe(name);
    }
  };

  return (
    <div>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Subscribe
          </Typography>
        </Stack>
      </Box>

      <FormGroup>
        <div className="flex">
        {availableSubscriptions.map((subscription) => (
          <FormControlLabel
            key={subscription.Name}
            control={
              <Checkbox
                checked={isSubscribed(subscription.Name)}
                onChange={() => handleToggleSubscription(subscription.Name)}
                disabled={!isConnected}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                {subscription.Name}
              </Typography>
            }
            sx={{
              marginBottom: 0.5,
            }}
          />
        ))}
        </div>
      </FormGroup>
    </div>
  );
};
