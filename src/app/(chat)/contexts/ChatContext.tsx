// chat/context/ChatContext.tsx
import { createContext, useContext, useState } from "react";
import { ChatContextType } from "../types/ChatContextType";
import { Mode } from "../types/Mode";

// Create context with initial null value but typed
const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<{ text: string; isUser: boolean }[]>([]);
  const addUserChat = (text: string) => {
    setChats((prev) => [...prev, { text: text, isUser: true }]);
  };
  const addBotChat = (text: string) => {
    setChats((prev) => [...prev, { text: text, isUser: false }]);
  };

  const [mode, setMode] = useState<Mode>("input");
  const setModeToLoading = () => {
    setMode("loading");
  };
  const setModeToSettings = () => {
    setMode("settings");
  };
  const setModeToInput = () => {
    setMode("input");
  };

  const value: ChatContextType = {
    chats,
    addUserChat,
    addBotChat,
    mode,
    setModeToLoading,
    setModeToSettings,
    setModeToInput,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
