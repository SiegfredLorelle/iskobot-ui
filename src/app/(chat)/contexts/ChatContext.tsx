import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Mode } from "../types/Mode";
import { ChatContextType } from "../types/ChatContextType";
import { ChatMessage } from "../types/ChatMessageType";
import { chatReducer } from "../reducers/chatReducer";
import { useFetchBotResponse } from "../hooks/useFetchBotResponse";

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetchBotResponse } = useFetchBotResponse();
  /* Chat messages */
  const [messages, dispatch] = useReducer(chatReducer, []);
  const [mode, setMode] = useState<Mode>("input");
  const [isBotTyping, setBotTyping] = useState(false);

  const createMessage = (text: string, isUser: boolean): ChatMessage => ({
    id: crypto.randomUUID(),
    text,
    isUser,
    timestamp: new Date(),
  });
  const addUserMessage = (text: string) => {
    dispatch({ type: "ADD_MESSAGE", payload: createMessage(text, true) });
  };
  const addBotMessage = (text: string) => {
    dispatch({ type: "ADD_MESSAGE", payload: createMessage(text, false) });
  };
  const deleteLastMessage = () => {
    dispatch({ type: "DELETE_LAST" });
  };
  const deleteAllMessage = () => {
    dispatch({ type: "DELETE_ALL" });
  };

  const sendMessageToBot = async (message: string) => {
    try {
      addUserMessage(message);
      setModeToLoading();
      showTypingIndicator();
      const response = await fetchBotResponse(message);
      hideTypingIndicator();
      addBotMessage(response);
    } catch (err) {
      console.error("Failed to send message:", err);
      hideTypingIndicator();
    } finally {
      setModeToInput();
    }
  };

  /* Controls Mode */
  const setModeToSettings = () => setMode("settings");
  const setModeToInput = () => setMode("input");
  const setModeToLoading = () => setMode("loading");

  /* Bot Typing State */
  const showTypingIndicator = () => setBotTyping(true);
  const hideTypingIndicator = () => setBotTyping(false);

  const value = useMemo(
    () => ({
      messages,
      addUserMessage,
      addBotMessage,
      deleteLastMessage,
      deleteAllMessage,
      sendMessageToBot,
      mode,
      setModeToLoading,
      setModeToSettings,
      setModeToInput,
      isBotTyping,
      showTypingIndicator,
      hideTypingIndicator,
    }),
    [messages, mode, isBotTyping],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
