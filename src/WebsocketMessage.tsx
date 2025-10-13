import Box from "@mui/material/Box";

export interface WebsocketMessageProps {
  message: MessageEvent<any>;
}

export const WebsocketMessage = ({ message }: WebsocketMessageProps) => (
  <Box component="section" className="text-wrap break-words">
    <div className="bg-gray-100">
      <div className="mb-2">{message ? message.data : null}</div>
    </div>
  </Box>
);
