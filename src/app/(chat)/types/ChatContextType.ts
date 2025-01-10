import { Mode } from "./Mode";

export type ChatContextType = {
  chats: { text: string; isUser: boolean }[];
  addUserChat: (text: string) => void;
  addBotChat: (text: string) => void;
  mode: Mode;
  setModeToLoading: () => void;
  setModeToSettings: () => void;
  setModeToInput: () => void;
  isBotTyping: boolean;
  showTypingIndicator: () => void;
  hideTypingIndicator: () => void;
}
