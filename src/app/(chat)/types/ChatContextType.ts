import { Mode } from "./Mode";

export interface ChatContextType {
  chats: { text: string; isUser: boolean }[];
  addUserChat: (text: string) => void;
  addBotChat: (text: string) => void;
  mode: "input" | "loading" | "settings";
  setModeToLoading: () => void;
  setModeToSettings: () => void;
  setModeToInput: () => void;
  isBotTyping: boolean; // Add this
  showTypingIndicator: () => void; // Add this
  hideTypingIndicator: () => void; // Add this
}
