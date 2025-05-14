import type { ChatMessage } from "./ChatMessageType";
import type { Mode } from "./Mode";

export type ChatContextType = {
  messages: ChatMessage[];
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  deleteLastMessage: () => void;
  deleteAllMessage: () => void;
  sendMessageToBot: (message: string) => void;
  mode: Mode;
  setModeToLoading: () => void;
  setModeToSettings: () => void;
  setModeToInput: () => void;
  userInput: string;
  setUserInput: (userInput: string) => void;
  isBotFetching: boolean;
  stopGenerating: () => void;
};
