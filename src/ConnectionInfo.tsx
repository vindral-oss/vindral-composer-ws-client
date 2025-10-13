import { colors } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { ReadyState } from "react-use-websocket";

export interface ConnectionPaneProps {
  status: ReadyState;
  url: string;
}

const renderWebsocketConnectionStatus = (status: ReadyState, url: string) => {
  switch (status) {
    case ReadyState.OPEN:
      return <span>Connected to {url}</span>;
    case ReadyState.CONNECTING:
      return (
        <div className="flex align-middle pr-4 gap-x-2">
          Loading {url}
          <CircularProgress size={20} />
        </div>
      );
    case ReadyState.CLOSED:
      return (
        <div>
          Connection is<span className="text-red-500"> closed</span>
        </div>
      );
  }
};

export const ConnectionInfo = ({ status, url }: ConnectionPaneProps) => (
  <div className="py-4">{renderWebsocketConnectionStatus(status, url)}</div>
);
