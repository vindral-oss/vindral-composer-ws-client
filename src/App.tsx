import { useState, useCallback, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { ConnectionInfo } from "./ConnectionInfo";
import { MessageHistory } from "./MessageHistory";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import React from "react";
import { SendMessage } from "./SendMessage";
import { AudioStrip } from "./AudioStrip";

interface Message {
  Type: string;
  Content: string | ContentString;
}

interface ContentString {
  ObjectId: string;
  PropertyName: string;
  Value: string | number | boolean;
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
  Id: string;
  Property: string;
}

const extractAudioStrips = (response: any): ComposerAudioObject[] => {
  const parsedContent = JSON.parse(response);
  const content = JSON.parse(parsedContent.Content);
  var dataArray = Object.keys(content).map(function (k) {
    return content[k];
  });

  return dataArray[0];
};

const updatePropertyValue = (
  content: any,
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
          Id: message.ObjectId,
          Property: message.PropertyName,
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
    console.log("Yo this happens once!");
    if (WS_URL_REGEX.test(url)) {
      if (url === socketUrl) {
        return;
      }

      setErrorText("");
      setSocketUrl(url);
    } else {
      setErrorText(url + " is not a valid websocket url");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 h-[100vh] overflow-scroll">
      <Grid container spacing={2}>
        <Grid size={3}>
          <div className="flex-1 min-h-[15vh]">
            <h1 className="text-3xl mb-4">Connection</h1>
            <div className="flex gap-x-4">
              <TextField
                id="wsUrl"
                label="Websocket URL"
                variant="outlined"
                onChange={(e) => setInputWsUrl(e.target.value)}
                value={inputWsUrl}
              />

              <Button
                variant="outlined"
                name="setWsUrl"
                onClick={() => handleClickChangeSocketUrl(inputWsUrl)}
              >
                Set url
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
            id={currentSelection?.Id}
            property={currentSelection?.Property}
            sendMessageFn={sendMessage}
          />
          <div className="h-auto">
            <MessageHistory
              messages={messageHistory}
              lastMessage={lastMessage}
            />
          </div>
        </Grid>
        <Grid size={9}>
          <div className="h-full w-full flex gap-x-4">
            {audioStrips?.map((audioObject) => (
              <React.Fragment key={audioObject.Id}>
                <AudioStrip
                  audioObject={audioObject}
                  lastUpdateProperty={lastUpdateProperty}
                  setCurrentSelectionFn={setCurrentSelection}
                />
              </React.Fragment>
            ))}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
