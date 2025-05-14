import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Mode } from "../types/Mode";
import type { ChatContextType } from "../types/ChatContextType";
import type { ChatMessage } from "../types/ChatMessageType";
import { chatReducer } from "../reducers/chatReducer";
import { useFetchBotResponse } from "../hooks/useFetchBotResponse";

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetchBotResponse, cancelFetch, isBotFetching } =
    useFetchBotResponse();
  /* Chat messages */
  const [messages, dispatch] = useReducer(chatReducer, []);
  const [mode, setMode] = useState<Mode>("input");
  const [userInput, setUserInput] = useState("");

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
      const response = await fetchBotResponse(message);
      addBotMessage(response);
    } catch (err) {
      // Only log non-cancellation errors
      if (!(err instanceof Error && err.message === "Request cancelled")) {
        console.error("Failed to send message:", err);
        addBotMessage("Sorry, I couldn't process your request.");
      } else {
        // Just log a info message for cancellations
        addBotMessage("Message generation was cancelled.");
        console.info("Message generation was cancelled by user");
      }
    } finally {
      setModeToInput();
    }
  };

  const stopGenerating = () => {
    cancelFetch();
    setModeToInput();
  };

  /* Controls Mode */
  const setModeToSettings = () => setMode("settings");
  const setModeToInput = () => setMode("input");
  const setModeToLoading = () => setMode("loading");

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
      userInput,
      setUserInput,
      isBotFetching,
      stopGenerating,
    }),
    [messages, mode, userInput],
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
