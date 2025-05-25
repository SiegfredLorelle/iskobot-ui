// types/ChatContextType.ts
import type { Mode } from "./Mode";
import type { ChatMessage } from "./ChatMessageType";

// Session type
export interface Session {
  id: string;
  user_id: string | null;  // Allow null for anonymous sessions
  title: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  message_count?: number;
  last_message?: string | null;
}

export interface ChatContextType {
  // Existing message management
  messages: ChatMessage[];
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  deleteLastMessage: () => void;
  deleteAllMessage: () => void;
  sendMessageToBot: (message: string) => Promise<void>;
  
  // Mode management
  mode: Mode;
  setModeToLoading: () => void;
  setModeToSettings: () => void;
  setModeToInput: () => void;
  
  // User input
  userInput: string;
  setUserInput: (input: string) => void;
  
  // Bot response state
  isBotFetching: boolean;
  stopGenerating: () => void;
  
  // Session management
  sessions: Session[];
  currentSession: Session | null;
  loadingSessions: boolean;
  sessionError: string | null;
  
  // Session actions
  createSession: (title?: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  startNewSession: () => void;
}