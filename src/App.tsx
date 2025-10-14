import React, { useCallback, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { AudioStrips } from "./AudioStrips";
import { LeftPane } from "./LeftPane";

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
  const [messagesAccordionOpen, setMessagesAccordionOpen] = useState(false);
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
        <LeftPane
          errorText={errorText}
          inputWsUrl={inputWsUrl}
          setInputWsUrl={(e) => setInputWsUrl(e.target.value)}
          handleClickChangeSocketUrl={() =>
            handleClickChangeSocketUrl(inputWsUrl)
          }
          audioStrips={audioStrips || []}
          currentSelection={currentSelection}
          sendMessage={sendMessage}
          messageHistory={messageHistory}
          lastMessage={lastMessage}
          audioStripsLayout={audioStripsLayout}
          setAudioStripsLayout={handleAlignment}
          messagesAccordionOpen={messagesAccordionOpen}
          setMessagesAccordionOpen={setMessagesAccordionOpen}
        />
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
              <AudioStrips
                audioStrips={audioStrips}
                setCurrentSelectionFn={setCurrentSelection}
              />
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
