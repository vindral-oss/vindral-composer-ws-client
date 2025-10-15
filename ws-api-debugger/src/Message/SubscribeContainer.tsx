import { PlayArrow, Stop } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState } from "react";

export interface Subscription {
  Name: string;
}

export interface SubscribeProps {
  activeSubscriptions: Subscription[];
  onSubscribe: (name: string) => void;
}

const availableSubscriptions: Subscription[] = [{ Name: "AudioMixer" }];

export const SubscribeContainer = ({
  activeSubscriptions,
  onSubscribe,
}: SubscribeProps) => {
  const [subscriptionName, setSubscriptionName] =
    useState<string>("AudioMixer");

  const isSubscribed = activeSubscriptions.some(
    (sub) => sub.Name === subscriptionName
  );

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
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
                console.log("You wanted to unsubscribe!");
                //onUnsubscribe(subscriptionName);
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
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
