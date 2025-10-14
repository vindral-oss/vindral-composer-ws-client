import { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { MessageHistory } from "./MessageHistory";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import React from "react";
import { SendMessage } from "./SendMessage";
import { AudioStrip } from "./AudioStrip";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import ArrowRightAltOutlinedIcon from "@mui/icons-material/ArrowRightAltOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";

import ViewModuleIcon from "@mui/icons-material/ViewModule";

interface Message {
  Type: string;
  Content: string | ContentString;
}

interface ContentString {
  ObjectId: string;
  PropertyName: string;
  Value: string | number;
}

export interface ComposerAudioObject {
  Id: string;
  Name: string;
  Properties: ComposerProperty[];
  SortOrder: number;
  Type: string;
  SelectedProperty?: string;
}

export type ComposerProperty = {
  PropertyDescription: string;
  PropertyName: string;
  PropertyType: string;
  CanWrite: boolean;
  Value: number | string;
  ValueEnum?: "string";
};

const subscribeMessage: Message = {
  Type: "Subscribe",
  Content: "audiomixer",
};

export interface UniqueSelection {
  AudioStripName: string;
  PropertyId: string;
  PropertyName: string;
}

/**
 * Optionally prunes content properties for performance reason
 */
const pruneProperties = (content: any) => {
  const pruneAllPropertiesBut = [
    "Mute",
    "StereoGainDb",
    "Pan",
    "Mute",
    "Solo",
    "PFL",
  ];
  return {
    ...content,
    AudioMixerStrips: content.AudioMixerStrips.map(
      (obj: ComposerAudioObject) => ({
        ...obj,
        Properties: obj.Properties.filter((name) =>
          pruneAllPropertiesBut.includes(name.PropertyName)
        ),
      })
    ),
  };
};

const extractAudioStrips = (
  response: unknown,
  prune: SHOW_PROPERTIES = SHOW_PROPERTIES.ALL
): ComposerAudioObject[] => {
  const parsedContent = JSON.parse(response as string);
  let content = JSON.parse(parsedContent.Content);

  // Pass prune = true to prune properties not in the list
  if (prune === SHOW_PROPERTIES.PRUNE) {
    content = pruneProperties(content);
  }

  return Object.keys(content).map((k) => content[k])[0];
};

const updatePropertyValue = (
  content: ContentString,
  audioStrips?: ComposerAudioObject[]
): ComposerAudioObject[] => {
  const updatedAudioStrips =
    audioStrips?.map((audioObject) => {
      if (audioObject.Id === content.ObjectId) {
        return {
          ...audioObject,
          Properties: [
            ...audioObject.Properties.map((property) => {
              if (property.PropertyName === content.PropertyName) {
                return { ...property, Value: content.Value };
              }
              return property;
            }),
          ],
        };
      }
      return audioObject;
    }) || [];

  return updatedAudioStrips;
};

const WS_URL = "ws://localhost:8081";
const RECONNECT_INTERVAL = 2000; // ms
const RECONNECT_ATTEMPTS = 5000;
const enum SHOW_PROPERTIES {
  ALL = "all",
  PRUNE = "prune",
}
const WS_URL_REGEX = new RegExp(
  /^(wss?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^/]+):([0-9]{1,5})$/
);

export default function App() {
  const [socketUrl, setSocketUrl] = useState(WS_URL);
  const [inputWsUrl, setInputWsUrl] = useState(WS_URL);
  const [errorText, setErrorText] = useState<string>("");
  const [audioStrips, setAudioStrips] = useState<ComposerAudioObject[]>();
  const [currentSelection, setCurrentSelection] = useState<UniqueSelection>();
  const [audioStripsLayout, setAudioStripsLayout] = useState<string | null>(
    "horizontal"
  );
  const [messageHistory, setMessageHistory] = useState<MessageEvent[]>([]);
  const [lastUpdateProperty, setLastUpdateProperty] =
    useState<UniqueSelection>();
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    onOpen: () => {
      sendMessage(JSON.stringify(subscribeMessage));
    },
    reconnectInterval: RECONNECT_INTERVAL,
    reconnectAttempts: RECONNECT_ATTEMPTS,
    onMessage: (message) => {
      const parsedJson = JSON.parse(message.data);
      if (parsedJson.Type === "AudioMixerSummary") {
        // Set prune = false to get all properties
        setAudioStrips(extractAudioStrips(message.data, SHOW_PROPERTIES.ALL));
      } else if (parsedJson.Type === "PropertyChanged") {
        const message = JSON.parse(parsedJson.Content);
        const updatedAudioStrips = updatePropertyValue(message, audioStrips);
        setLastUpdateProperty({
          AudioStripName: parsedJson.Name,
          PropertyId: message.ObjectId,
          PropertyName: message.PropertyName,
        });
        setAudioStrips(updatedAudioStrips);
      }
    },
    onClose: () => {
      setMessageHistory([]);
      setAudioStrips([]);
      console.log("Connection is closed");
    },
  });

  useEffect(() => {
    if (lastMessage === null) {
      return;
    }

    setMessageHistory((prev) => [lastMessage, ...prev]);
  }, [lastMessage]);

  const handleClickChangeSocketUrl = useCallback((url: string) => {
    if (WS_URL_REGEX.test(url)) {
      setErrorText("");
      setSocketUrl(url);
    } else {
      setErrorText(url + " is not a valid websocket url");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAlignment = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    setAudioStripsLayout(newAlignment);
  };

  return (
    <div className="min-h-screen h-screen overflow-scroll bg-white">
      <div className="flex">
        <div className="flex flex-col fixed top-0 bottom-0 left-0 w-[680px] max-w-[680px] bg-white z-20 p-3 border-r border-gray-200 shadow-md">
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-4 items-center mb-2">
              <div>
                <h1 className="text-base font-bold mb-3">Connection</h1>

                <div className="flex gap-1">
                  <TextField
                    fullWidth
                    id="wsUrl"
                    label="Websocket URL"
                    size="small"
                    variant="outlined"
                    onChange={(e) => setInputWsUrl(e.target.value)}
                    value={inputWsUrl}
                  />
                  <Button
                    variant="contained"
                    name="setWsUrl"
                    size="small"
                    onClick={() => handleClickChangeSocketUrl(inputWsUrl)}
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
                  onChange={handleAlignment}
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
            <MessageHistory
              messages={messageHistory}
              lastMessage={lastMessage}
            />
          </div>
        </div>
        <div className="flex-1 ml-[680px] p-4">
          <div
            className={`flex ${
              audioStripsLayout === "grid"
                ? "flex-wrap"
                : audioStripsLayout === "horizontal"
                ? "flex"
                : "flex flex-col"
            }  gap-6`}
          >
            {audioStrips && audioStrips.length > 0 ? (
              audioStrips?.map((audioObject) => (
                <React.Fragment key={audioObject.Id}>
                  <AudioStrip
                    audioObject={audioObject}
                    lastUpdateProperty={lastUpdateProperty}
                    setCurrentSelectionFn={setCurrentSelection}
                  />
                </React.Fragment>
              ))
            ) : (
              <div>
                {readyState === ReadyState.CLOSED && (
                  <div>Not connected to Composer.</div>
                )}
                {readyState === ReadyState.CONNECTING && (
                  <div>Connecting to Composer.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
