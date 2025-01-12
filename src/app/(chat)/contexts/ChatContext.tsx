import { createContext, useContext, useMemo, useReducer, useState } from "react";
import { Mode } from "../types/Mode";
import { ChatContextType } from "../types/ChatContextType";
import { ChatMessage } from "../types/ChatMessageType";
import { chatReducer } from "../reducers/chatReducer";

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  /* Chat messages */
  const [messages, dispatch] = useReducer(chatReducer, []);
  const createMessage = (text: string, isUser: boolean): ChatMessage => ({
    id: crypto.randomUUID(),
    text,
    isUser,
    timestamp: new Date(),
  });
  const addUserMessage = (text: string) => {
    dispatch({type:"ADD_MESSAGE", payload: createMessage(text, true)})
  }
  const addBotMessage = (text: string) => {
    dispatch({type:"ADD_MESSAGE", payload: createMessage(text, false)})
  }
  const deleteLastMessage = () => {
    dispatch({type:"DELETE_LAST"});
  }
  const deleteAllMessage = () => {
    dispatch({type: "DELETE_ALL"})
  }
  
  /* Controls Mode */
  const [mode, setMode] = useState<Mode>("input");
  const setModeToSettings = () => setMode("settings");
  const setModeToInput = () => setMode("input");
  const setModeToLoading = () => setMode("loading");

  /* Bot Typing State */
  const [isBotTyping, setBotTyping] = useState(false);
  const showTypingIndicator = () => setBotTyping(true);
  const hideTypingIndicator = () => setBotTyping(false);
  
  const value = useMemo(() => ({
    messages,
    addUserMessage,
    addBotMessage,
    deleteLastMessage,
    deleteAllMessage,
    mode,
    setModeToLoading,
    setModeToSettings,
    setModeToInput,
    isBotTyping,
    showTypingIndicator,
    hideTypingIndicator,
  }), [messages, mode, isBotTyping])
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};