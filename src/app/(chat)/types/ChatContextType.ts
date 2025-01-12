import { ChatMessage } from "./ChatMessageType";
import { Mode } from "./Mode";

export type ChatContextType = {
  messages: ChatMessage[];
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  deleteLastMessage: () => void;
  deleteAllMessages: () => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  isBotTyping: boolean;
  setBotTyping: (typing: boolean) => void;
};
