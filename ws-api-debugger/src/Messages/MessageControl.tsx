import { Button, TextField, FormControlLabel, Switch } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import type { Dispatch, SetStateAction } from "react";

interface MessageControlProps {
  prettyPrint: boolean;
  setPrettyPrint: Dispatch<SetStateAction<boolean>>;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  maxMessages: number;
  setMaxMessages: Dispatch<SetStateAction<number>>;
  clearMessages: () => void;
  paused: boolean;
  setPaused: (value: boolean) => void;
  clearDisabled: boolean;
  pauseDisabled: boolean;
}

export function MessageControl({
  prettyPrint,
  setPrettyPrint,
  filter,
  setFilter,
  maxMessages,
  setMaxMessages,
  clearMessages,
  paused,
  setPaused,
  clearDisabled,
  pauseDisabled,
}: MessageControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Button
          size="small"
          variant="outlined"
          startIcon={paused ? <PlayArrow /> : <Pause />}
          onClick={() => setPaused(!paused)}
          className="text-xs"
          disabled={pauseDisabled}
        >
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={clearMessages}
          className="text-xs"
          disabled={clearDisabled}
        >
          Clear
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={prettyPrint}
              onChange={(e) => setPrettyPrint(e.target.checked)}
              size="small"
            />
          }
          label="Pretty Print"
          className="text-xs whitespace-nowrap"
        />
      </div>

      <div className="flex items-center gap-2">
        <TextField
          label="Filter"
          size="small"
          value={filter}
          fullWidth
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs"
          sx={{ minWidth: 120 }}
        />

        <TextField
          label="Message History Limit"
          size="small"
          type="number"
          fullWidth
          value={maxMessages}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 100;
            setMaxMessages(Math.min(value, 10000));
          }}
          inputProps={{ min: 1, max: 10000 }}
          className="text-xs"
          sx={{ minWidth: 140 }}
        />
      </div>
    </div>
  );
}
