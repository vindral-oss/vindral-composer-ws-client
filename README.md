# Build and run
`npm install`

`npm run dev`

# Prerequisites

Requires [Vindral Composer R4 2025](https://vindral.com/composer/).

# Setup

For Composer Runtime, edit the `settings.xml` to enable the WebSocket API:

```BASH
"EnableWebSockets": true,
"WebSocketsHostName": "localhost",
"WebSocketsPort": 8081,
"WebSocketThrottledPropertiesFrequency": 3000
```

Setting `WebSocketThrottledPropertiesFrequency` is optional and will control the latency for property changed events.

For Composer Desktop, make the necessary changes in the `Settings` -> `Web API` menu.

<img width="1382" height="893" alt="2025-10-13_1382x893_scrot" src="https://github.com/user-attachments/assets/03fcf71d-4b24-4f83-a353-fca1e61c8ffe" />

# What this example application does

> [!NOTE]
> This is just an early example of the initial feature set of the Composer WebSocket API. More features will be added later.

## Startup

- It will connect to the specified `Websocket URL`
- It will automatically subscribe to `AudioMixer` events (the only events available, as of today).
- It will automatically extract each available `Audio Strip` and its properties

## Left drawer

The left drawer allows the user to change;

- `Websocket URL`
- The output (printing) format of incoming messages (either raw or `Pretty`)
- Set a message history `Limit`
- Filter incoming messages
- Send messages

## Sending messages

There are two ways to send messages - both ways will programmatically build and show the exact formatted string that is is sent to the WebSocket.

### Manually constructing the message object

Messages can be constructred by selecting any available `Audio Strip` and `Property` from the dropdowns and proving a new `Value`.

### Click any writeable property Name

Click on any _Writeable_ property's _Name_ in either `Audio Strip` table to pre-populate the dropdowns. Then supply a value.

### Message format

The `Update property value` message format is:

```
{
    "Type": "SetPropertyValueByObjectId",
    "Content": "{
        \"ObjectId\": \"<audio-strip-id>\",
        \"PropertyName\": \"<audio-strip-property-name>\",
        \"Value\": \"<audio-strip-value>\",
    }"
}
```
