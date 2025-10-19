import Box from "@mui/material/Box";

export interface WebsocketMessageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: MessageEvent<any>;
  prettyPrint: boolean;
}

export const WebsocketMessage = ({
  message,
  prettyPrint,
}: WebsocketMessageProps) => {
  let content = "";
  let json;
  if (message.data) {
    json = JSON.parse(message.data);
    if (json.Content) {
      // If Composer message data has JSON content, parse it for pretty printing
      if ((json.Content as string).includes("{")) {
        content = json.Content;
        content = json.Content.replaceAll(/\n/g, "");
        content = content.replaceAll(/\\"/g, "");
        content = JSON.parse(content);
      } else {
        content = json.Content;
      }
    }
  }

  const prettyContent = JSON.stringify(content, null, 2);
  const rawJson = JSON.parse(message.data);
  const prettyTime = new Date(rawJson.DateTime).toUTCString();
  const type = rawJson.Type;

  return (
    <Box
      component="section"
      className={`text-wrap p-2 break-words ${
        type === "Error" ? "bg-red-500" : "bg-white"
      }`}
    >
      {prettyPrint && (
        <div className={`flex font-bold mb-4`}>
          <div className="font-bold mr-auto">{rawJson.Type}</div>
          <div className="justify-end">{prettyTime}</div>
        </div>
      )}
      <pre>{prettyPrint ? prettyContent : message.data}</pre>
    </Box>
  );
};
