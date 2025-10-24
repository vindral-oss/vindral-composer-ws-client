# Run

`npm run dev`

# Prerequisites

Requires [Vindral Composer R4 2025](https://vindral.com/composer/).

# Setup

For Composer Runtime, edit the `settings.xml` to enable the WebSocket API:

```BASH
"EnableWebSockets": true,
"WebSocketsHostName": "localhost",
"WebSocketsPort": 8081,
"WebSocketThrottledPropertiesFrequency": 0
"WebSocketsMaxIncomingMessageQueueLength": 20
```

Setting `WebSocketThrottledPropertiesFrequency` is optional and will control the latency for property changed events.

For Composer Desktop, make the necessary changes in the `Settings` -> `Web API` menu.

<img width="837" height="549" alt="2025-10-23_837x549_scrot" src="https://github.com/user-attachments/assets/21d62290-1070-456a-8a44-87684507428b" />

# Remote access
Specify the external IP (or any external hostname, other than localhost) under `Hostname` to allow for remote connections to Composer's WebSocket server.

# What this example application does

> [!NOTE]
> This is just an early example of the initial feature set of the Composer WebSocket API. More features will be added later.

This is a web-based companion app to showcase the features of Vindral composer's WebSocket API.
It only supports the AudioMixer channel for now.

After subscribing; Composer will send a full list of available properties (read-only and writeable).

# Sending messages

After subscribing, the application will extract all available `Audio strips` from the running Composer project and filter out properties that have `Can Write: true`.

To send a message;

1. Select the audio strip
2. Select the property
3. Supply the value

When constructing the message, the code block will highlight the resulting message to make it easy to copy and paste the message structure.

## Incoming/Outgoing messages

View and filter all incoming and outgoing (sent) messages. Pausing any message channel will queue messages until resumed.
