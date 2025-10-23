// Global variable to store sendMessage function
let globalSendMessage: ((message: string) => void) | null = null;

export function setSendMessage(sendMessage: ((message: string) => void) | null) {
  globalSendMessage = sendMessage;
}

export function getSendMessage() {
  return globalSendMessage;
}