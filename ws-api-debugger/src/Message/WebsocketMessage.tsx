import Box from "@mui/material/Box";

export interface WebsocketMessageProps {
  message: MessageEvent<string>;
  prettyPrint: boolean;
}

export const WebsocketMessage = ({
  message,
  prettyPrint,
}: WebsocketMessageProps) => {
  const json = message.data ? JSON.parse(message.data) : null;
  const type = json?.Type ?? "";
  const prettyTime = json?.DateTime
    ? new Date(json.DateTime).toUTCString()
    : "";
  let content: unknown = "";
  if (json?.Content) {
    if (typeof json.Content === "string" && json.Content.includes("{")) {
      let cleaned = json.Content.replaceAll(/\n/g, "");
      cleaned = cleaned.replaceAll(/\\"/g, "");
      try {
        content = JSON.parse(cleaned);
      } catch {
        content = cleaned;
      }
    } else {
      content = json.Content;
    }
  }
  const prettyContent = JSON.stringify(content, null, 2);
  return (
    <Box
      component="section"
      className={`text-wrap p-2 wrap-break-word ${
        type === "Error" ? "bg-red-500" : "bg-white"
      }`}
    >
      {prettyPrint && (
        <div className="flex flex-wrap font-bold mb-4">
          <div className="font-bold mr-auto">{type}</div>
          <div className="justify-end">{prettyTime}</div>
        </div>
      )}
      <pre>{prettyPrint ? prettyContent : message.data}</pre>
    </Box>
  );
};
