import { Delete, Pause, PlayArrow } from "@mui/icons-material";
import {
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import React from "react";

export interface MessageControlProps {
  prettyPrint: boolean;
  setPrettyPrint: (value: boolean) => void;
  filter: string;
  setFilter: (value: string) => void;
  maxMessages: number;
  setMaxMessages: (value: number) => void;
  clearMessages: () => void;
  paused: boolean;
  setPaused: (value: boolean) => void;
  queuedCount?: number;
  clearDisabled?: boolean;
  pauseDisabled?: boolean;
}

export const MessageControl: React.FC<MessageControlProps> = ({
  prettyPrint,
  setPrettyPrint,
  filter,
  setFilter,
  maxMessages,
  setMaxMessages,
  clearMessages,
  paused,
  setPaused,
  queuedCount = 0,
  clearDisabled = false,
  pauseDisabled = false,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center w-full">
      <FormControlLabel
        control={<Switch />}
        checked={prettyPrint}
        onChange={() => setPrettyPrint(!prettyPrint)}
        label="Pretty print"
        className="flex-1"
        sx={{ flex: "1 1 180px", minWidth: 0 }}
      />
      <TextField
        type="text"
        value={filter}
        size="small"
        label="Filter messages"
        onChange={(e) => setFilter(e.target.value)}
        fullWidth
        className="flex-1 min-w-[180px]"
        sx={{ flex: "1 1 180px", minWidth: 0 }}
      />
      <TextField
        type="number"
        value={maxMessages}
        size="small"
        InputProps={{
          startAdornment: <InputAdornment position="start">max</InputAdornment>,
        }}
        label="Message history"
        onChange={(e) => {
          const raw = e.target.value;
          let val = raw === "" ? 1 : Number.parseInt(raw);
          val = Math.max(1, Math.min(100, val));
          setMaxMessages(val);
        }}
        fullWidth
        className="flex-1 min-w-[120px]"
        sx={{ flex: "1 1 120px", minWidth: 0 }}
      />
      <div className="flex gap-2 items-center" style={{ flex: "0 0 auto" }}>
        <Tooltip title={paused ? "Resume updates" : "Pause updates"} arrow>
          <span className="relative">
            <IconButton
              aria-label={paused ? "Resume updates" : "Pause updates"}
              onClick={() => setPaused(!paused)}
              disabled={pauseDisabled}
              sx={{
                backgroundColor: paused ? "#ff9800" : "#ff9800",
                color: paused ? "#fff" : "#fff",
                "&:hover": {
                  backgroundColor: paused ? "#fb8c00" : "#fb8c00",
                },
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              {paused ? <PlayArrow /> : <Pause />}
            </IconButton>
            {paused && queuedCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 shadow"
                style={{ minWidth: 24, textAlign: "center" }}
              >
                {queuedCount}
              </span>
            )}
          </span>
        </Tooltip>
        <Tooltip title="Clear messages" arrow>
          <span>
            <IconButton
              aria-label="Clear history"
              onClick={clearMessages}
              disabled={clearDisabled}
              sx={{
                backgroundColor: clearDisabled ? "#ffe0b2" : "#ff9800",
                color: clearDisabled ? "#bbb" : "#fff",
                "&:hover": {
                  backgroundColor: clearDisabled ? "#ffe0b2" : "#fb8c00",
                },
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <Delete />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};
