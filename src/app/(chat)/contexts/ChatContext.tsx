import { createContext, useContext, useReducer, useState } from "react";
import { Mode } from "../types/Mode";
import { ChatContextType } from "../types/ChatContextType";
import { ChatMessage } from "../types/ChatMessageType";
import { chatReducer } from "../reducers/chatReducer";

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, dispatch] = useReducer(chatReducer, []);
  const [mode, setMode] = useState<Mode>("input");
  const [isBotTyping, setBotTyping] = useState(false);

  const createMessage = (text: string, isUser: boolean): ChatMessage => ({
    id: crypto.randomUUID(),
    text,
    isUser,
    timestamp: new Date(),
  });

  const value: ChatContextType = {
    messages,
    addUserMessage: (text: string) => 
      dispatch({ type: 'ADD_MESSAGE', payload: createMessage(text, true) }),
    addBotMessage: (text: string) => 
      dispatch({ type: 'ADD_MESSAGE', payload: createMessage(text, false) }),
    deleteLastMessage: () => dispatch({ type: 'DELETE_LAST' }),
    deleteAllMessages: () => dispatch({ type: 'DELETE_ALL' }),
    mode,
    setMode,
    isBotTyping,
    setBotTyping,
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