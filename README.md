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
"WebSocketThrottledPropertiesFrequency": 3000
```

Setting `WebSocketThrottledPropertiesFrequency` is optional and will control the latency for property changed events.

For Composer Desktop, make the necessary changes in the `Settings` -> `Web API` menu.

<img width="1382" height="893" alt="2025-10-13_1382x893_scrot" src="https://github.com/user-attachments/assets/03fcf71d-4b24-4f83-a353-fca1e61c8ffe" />

# What this example application does
> [!NOTE]
> This is just an early example of the initial feature set of the Composer WebSocket API. More features will be added later.

## Startup
1) It will connect to the specified `Websocket URL`
2) It will automatically subscribe to `AudioMixer` events (the only events available, as of today).
3) It will automatically extract each available `Audio Strip` and its;
  3.1) Name
  3.2) ID
  3.3) Properties

<img width="1914" height="1279" alt="2025-10-13_1914x1279_scrot" src="https://github.com/user-attachments/assets/4b79e1cc-7228-4aac-ab8c-63339e352a20" />

## Left drawer
The left drawer allows the user to change;

* `Websocket URL`
* The output (printing) format of incoming messages (either raw or `Pretty`)
* Set a message history `Limit`
* Send messages

### Sending messages
Sending messages can be done by either manually constructing the message by selecting the appropriate `Audio Strip` and `Property` and proving a new `Value`:

<img width="621" height="278" alt="2025-10-13_621x278_scrot" src="https://github.com/user-attachments/assets/aac8b66e-4e11-4c37-b27f-6ac696968fcd" />

Or by selecting (clicking) on any *Writeable* property's *Name* in either `Audio Strip` table.

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
