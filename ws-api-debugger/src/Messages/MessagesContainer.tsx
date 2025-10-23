import IncomingMessages from "./IncomingMessages";
import OutgoingMessages from "./OutgoingMessages";
import { useMessagesContext } from "../context/useSpecializedContexts";

export function MessagesContainer() {
  const { registerIncomingHandler, registerOutgoingHandler } =
    useMessagesContext();

  return (
    <>
      <IncomingMessages registerHandler={registerIncomingHandler} />
      <OutgoingMessages registerHandler={registerOutgoingHandler} />
    </>
  );
}
