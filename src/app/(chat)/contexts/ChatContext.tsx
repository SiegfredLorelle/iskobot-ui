// chat/context/ChatContext.tsx
import { createContext, useContext, useState } from 'react';
import { ChatContextType } from '../types/ChatContextType';

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
  
  const [mode, setMode] = useState<string>('input');
  const [messages, setMessages] = useState<any[]>([]);
  
  const handleSendMessage = () => {
    // Implementation
  };

  const value: ChatContextType = {
    chats,
    addUserChat,
    addBotChat,
    mode,
    setMode,
    messages,
    setMessages,
    handleSendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};