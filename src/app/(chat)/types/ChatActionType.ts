import { ChatMessage } from "./ChatMessageType";

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "DELETE_LAST" }
  | { type: "DELETE_ALL" };
