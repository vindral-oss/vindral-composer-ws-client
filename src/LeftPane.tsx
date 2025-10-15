import React from "react";
import type { SendMessage as SendMessageFn } from "react-use-websocket";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { SendMessage } from "./SendMessage";
import { MemoizedMessageHistory } from "./MessageHistory";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import ToggleButton from "@mui/material/ToggleButton";

import ArrowRightAltOutlinedIcon from "@mui/icons-material/ArrowRightAltOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ComposerAudioObject } from "./App";

export interface LeftPaneProps {
  errorText: string;
  inputWsUrl: string;
  setInputWsUrl: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickChangeSocketUrl: () => void;
  audioStrips: ComposerAudioObject[];
  currentSelection?: {
    AudioStripName?: string;
    PropertyId?: string;
    PropertyName?: string;
  };
  sendMessage: SendMessageFn;
  messageHistory: MessageEvent[];
  lastMessage: MessageEvent | null;
  audioStripsLayout: string | null;
  setAudioStripsLayout: (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => void;
  messagesAccordionOpen: boolean;
  setMessagesAccordionOpen: (open: boolean) => void;
}

const LeftPaneComponent: React.FC<LeftPaneProps> = ({
  errorText,
  inputWsUrl,
  setInputWsUrl,
  handleClickChangeSocketUrl,
  audioStrips,
  currentSelection,
  sendMessage,
  messageHistory,
  lastMessage,
  audioStripsLayout,
  setAudioStripsLayout,
}) => {
  return (
    <div className="flex flex-col fixed top-0 bottom-0 left-0 w-[680px] max-w-[680px] bg-white z-20 p-3 border-r border-gray-200 shadow-md">
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-4 items-center mb-2">
          <div>
            <h1 className="text-base font-bold mb-3">Connection</h1>
            <div className="flex gap-1">
              <TextField
                id="wsUrl"
                label="Websocket URL"
                size="small"
                variant="outlined"
                onChange={setInputWsUrl}
                value={inputWsUrl}
              />
              <Button
                variant="contained"
                name="setWsUrl"
                size="small"
                onClick={handleClickChangeSocketUrl}
                className="bg-[#FDBF79] text-black font-bold border-none hover:bg-[#fda94d]"
              >
                Set
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold mb-3">Content layout</h1>
            <ToggleButtonGroup
              value={audioStripsLayout}
              exclusive
              onChange={setAudioStripsLayout}
              aria-label="text alignment"
            >
              <ToggleButton value="horizontal" aria-label="left aligned">
                <ArrowRightAltOutlinedIcon />
              </ToggleButton>
              <ToggleButton value="vertical" aria-label="centered">
                <ArrowDownwardOutlinedIcon />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="right aligned">
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>
        {errorText !== "" && (
          <Alert className="mt-1" severity="error">
            {errorText}
          </Alert>
        )}
      </div>
      <div className="mb-2">
        <SendMessage
          clickSelectedAudioStrip={currentSelection?.AudioStripName}
          clickSelectedId={currentSelection?.PropertyId}
          clickSelectedProperty={currentSelection?.PropertyName}
          sendMessageFn={sendMessage}
          audioStrips={audioStrips || []}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <MemoizedMessageHistory
          messages={messageHistory}
          lastMessage={lastMessage}
          noAccordion
        />
      </div>
    </div>
  );
};

export const LeftPane = React.memo(LeftPaneComponent);
