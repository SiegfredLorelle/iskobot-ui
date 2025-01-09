import { Dispatch, SetStateAction } from 'react';

export type ChatContextType = {
  chats: { text: string; isUser: boolean }[];
  addUserChat: (text: string) => void;
  addBotChat: (text: string) => void;
  mode: string;
  setMode: Dispatch<SetStateAction<string>>;
  messages: any[]; 
  setMessages: Dispatch<SetStateAction<any[]>>;
  handleSendMessage: () => void;
}