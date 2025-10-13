import { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { ConnectionInfo } from "./ConnectionInfo";
import { MessageHistory } from "./MessageHistory";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import React from "react";
import { SendMessage } from "./SendMessage";
import { AudioStrip } from "./AudioStrip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

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

interface ComposerProperty {
  PropertyDescription: string;
  PropertyName: string;
  PropertyType: string;
  CanWrite: boolean;
  Value: number | string;
  ValueEnum?: "string";
}

const subscribeMessage: Message = {
  Type: "Subscribe",
  Content: "audiomixer",
};

export interface UniqueSelection {
  AudioStripName: string;
  PropertyId: string;
  PropertyName: string;
}

const extractAudioStrips = (response: unknown): ComposerAudioObject[] => {
  const parsedContent = JSON.parse(response as string);
  const content = JSON.parse(parsedContent.Content);
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
const WS_URL_REGEX = new RegExp(
  /^(wss?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^/]+):([0-9]{1,5})$/
);

export default function App() {
  const [socketUrl, setSocketUrl] = useState(WS_URL);
  const [inputWsUrl, setInputWsUrl] = useState(WS_URL);
  const [errorText, setErrorText] = useState<string>("");
  const [audioStrips, setAudioStrips] = useState<ComposerAudioObject[]>();
  const [currentSelection, setCurrentSelection] = useState<UniqueSelection>();
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
        setAudioStrips(extractAudioStrips(message.data));
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

  return (
    <Paper elevation={3} className="min-h-[100vh] h-[100vh] overflow-scroll">
      <Grid container spacing={2}>
        <div
          style={{ boxShadow: "2px 0 16px -2px #888" }}
          className="fixed w-[680px] max-w-[680px] bottom-0 top-0  bg-white z-20  p-4"
        >
          <div className="flex-1">
            <h1 className="text-3xl mb-4">Connection</h1>
            <div className="flex gap-x-4">
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
                variant="outlined"
                name="setWsUrl"
                size="small"
                onClick={() => handleClickChangeSocketUrl(inputWsUrl)}
              >
                Set
              </Button>
            </div>
            {errorText !== "" && (
              <Alert className="mt-2" severity="error">
                {errorText}
              </Alert>
            )}
            <ConnectionInfo status={readyState} url={socketUrl} />
          </div>
          <SendMessage
            clickSelectedAudioStrip={currentSelection?.AudioStripName}
            clickSelectedId={currentSelection?.PropertyId}
            clickSelectedProperty={currentSelection?.PropertyName}
            sendMessageFn={sendMessage}
            audioStrips={audioStrips || []}
          />
          <div className="h-auto">
            <MessageHistory
              messages={messageHistory}
              lastMessage={lastMessage}
            />
          </div>
        </div>
        <Grid size={9} className="p-4 ml-[678px]">
          <h2 className="mt-2 mb-2 ml-4 text-3xl">Audio strips</h2>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={2}
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
              <div className="ml-4">
                {readyState === ReadyState.CLOSED && (
                  <div className="ml-4">Not connected to Composer.</div>
                )}
                {readyState === ReadyState.CONNECTING && (
                  <div className="ml-4">Connecting to Composer.</div>
                )}
              </div>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
