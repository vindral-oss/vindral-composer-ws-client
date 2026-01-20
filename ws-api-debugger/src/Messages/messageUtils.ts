// Simple hash function for generating stable keys
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Pre-processed message interface
export interface ProcessedMessage {
  originalMessage: MessageEvent<string>;
  key: string;
  parsedData: {
    type: string;
    prettyTime: string;
    prettyContent: string;
  };
  timestamp: number;
}

// Pre-process a single message
export function processMessage(message: MessageEvent<string>): ProcessedMessage {
  const timestamp = message.timeStamp || Date.now();
  
  // Generate stable key using timestamp and content hash
  const contentPreview = message.data?.slice(0, 100) || '';
  const key = `${timestamp}-${simpleHash(contentPreview)}`;

  // Pre-parse the JSON data
  const parsedData = (() => {
    try {
      const json = message.data ? JSON.parse(message.data) : null;
      const type = json?.Type ?? "";
      const prettyTime = json?.DateTime
        ? new Date(json.DateTime).toUTCString()
        : "";

      let content: unknown = "";
      if (json?.Content) {
        if (typeof json.Content === "string") {
          try {
            // Try to parse Content as JSON (it's usually a JSON string)
            content = JSON.parse(json.Content);
          } catch {
            // If parsing fails, try the old cleanup method
            let cleaned = json.Content.replaceAll(/\n/g, "");
            cleaned = cleaned.replaceAll(/\\"/g, "");
            try {
              content = JSON.parse(cleaned);
            } catch {
              content = json.Content;
            }
          }
        } else {
          content = json.Content;
        }
      }

      if (json?.Type === "LogMessage" && content && typeof content === "object") {
        const contentObj = content as Record<string, unknown>;
        if (contentObj.Message && typeof contentObj.Message === "string") {
          try {
            // The Message field is JSON-stringified, parse it
            const parsedMessage = JSON.parse(contentObj.Message);
            // Replace the stringified Message with the parsed object
            content = {
              ...contentObj,
              Message: parsedMessage
            };
          } catch {
            // If parsing fails, keep as is
          }
        }
      }

      const prettyContent = JSON.stringify(content, null, 2);

      return { type, prettyTime, prettyContent };
    } catch {
      // Fallback for invalid JSON
      return {
        type: "Parse Error",
        prettyTime: "",
        prettyContent: message.data || "",
      };
    }
  })();

  return {
    originalMessage: message,
    key,
    parsedData,
    timestamp,
  };
}