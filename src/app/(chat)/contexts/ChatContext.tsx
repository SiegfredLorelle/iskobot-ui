import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  useCallback,
} from "react";
import type { Mode } from "../types/Mode";
import type { ChatContextType } from "../types/ChatContextType";
import type { ChatMessage } from "../types/ChatMessageType";
import { chatReducer } from "../reducers/chatReducer";

// Enhanced types for session management
interface Session {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface BackendMessage {
  id: string;
  session_id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  created_at: string;
}

interface ChatResponse {
  response: string;
  session_id: string;
  message_id: string;
}

// Enhanced ChatContextType (you'll need to update your type definition)
interface EnhancedChatContextType extends ChatContextType {
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

// Enhanced hook for backend communication
const useEnhancedBotResponse = () => {
  const [isBotFetching, setIsBotFetching] = useState(false);
  const [botFetchingError, setBotFetchingError] = useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const isAuthenticated = useCallback(() => {
    return Boolean(localStorage.getItem('auth_token'));
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }, []);


const fetchBotResponse = async (message: string, sessionId?: string): Promise<ChatResponse> => {
    setIsBotFetching(true);
    setBotFetchingError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!endpoint) {
      throw new Error("Endpoint not initialized");
    }

    try {
      const body: Record<string, any> = { query: message };
      
      // Only include session_id if authenticated
      if (isAuthenticated()) {
        body.session_id = sessionId;
      }

      const response = await fetch(`${endpoint}/chat/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData}`,
        );
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Request cancelled");
      }

      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setBotFetchingError(errorMessage);
      throw err;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsBotFetching(false);
    }
  };

  const cancelFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsBotFetching(false);
  };

  // Session management API calls
  const createSessionAPI = async (title: string): Promise<Session> => {
    if (!endpoint) throw new Error("Endpoint not initialized");

    const response = await fetch(`${endpoint}/sessions/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create session: ${errorData}`);
    }

    return response.json();
  };

  const getSessionsAPI = useCallback(async (): Promise<Session[]> => {
    if (!endpoint) throw new Error("Endpoint not initialized");
    if (!isAuthenticated()) return [];
    const response = await fetch(`${endpoint}/sessions/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get sessions: ${errorData}`);
      }

      return response.json();
    }, [endpoint, getAuthHeaders, isAuthenticated]);

  const getSessionMessagesAPI = async (sessionId: string): Promise<BackendMessage[]> => {
    if (!endpoint) throw new Error("Endpoint not initialized");

    const response = await fetch(`${endpoint}/sessions/${sessionId}/messages`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get messages: ${errorData}`);
    }

    return response.json();
  };

  const deleteSessionAPI = async (sessionId: string): Promise<void> => {
    if (!endpoint) throw new Error("Endpoint not initialized");

    const response = await fetch(`${endpoint}/sessions/${sessionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to delete session: ${errorData}`);
    }
  };

  const updateSessionTitleAPI = async (sessionId: string, title: string): Promise<void> => {
    if (!endpoint) throw new Error("Endpoint not initialized");

    const response = await fetch(`${endpoint}/sessions/${sessionId}/title`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to update title: ${errorData}`);
    }
  };

  return {
    fetchBotResponse,
    cancelFetch,
    isBotFetching,
    botFetchingError,
    createSessionAPI,
    getSessionsAPI,
    getSessionMessagesAPI,
    deleteSessionAPI,
    updateSessionTitleAPI,
  };
};

const ChatContext = createContext<EnhancedChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    fetchBotResponse,
    cancelFetch,
    isBotFetching,
    createSessionAPI,
    getSessionsAPI,
    getSessionMessagesAPI,
    deleteSessionAPI,
    updateSessionTitleAPI,
  } = useEnhancedBotResponse();

  // Existing state
  const [messages, dispatch] = useReducer(chatReducer, []);
  const [mode, setMode] = useState<Mode>("input");
  const [userInput, setUserInput] = useState("");

  // New session state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const isAuthenticated = useCallback(() => {
    return Boolean(localStorage.getItem('auth_token'));
  }, []);

  // Helper function to convert backend messages to ChatMessage format
  const convertToLocalMessage = (backendMsg: BackendMessage): ChatMessage => ({
    id: backendMsg.id,
    text: backendMsg.content,
    isUser: backendMsg.role === 'USER',
    timestamp: new Date(backendMsg.created_at),
  });

  // Existing message functions
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

  // Enhanced sendMessageToBot with session awareness
  const sendMessageToBot = async (message: string) => {
    try {
      addUserMessage(message);
      setModeToLoading();
      
      const authStatus = Boolean(localStorage.getItem('auth_token'));

      const response = await fetchBotResponse(
        message, 
        authStatus ? currentSession?.id : undefined
      );      
      addBotMessage(response.response);
      
      // Update current session if a new one was created
      
    if (authStatus) {
      if (!currentSession && response.session_id) {
        setCurrentSession({
          id: response.session_id,
          user_id: "temp",
          title: "New Chat",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
    } catch (err) {
      if (!(err instanceof Error && err.message === "Request cancelled")) {
        console.error("Failed to send message:", err);
        addBotMessage("Sorry, I couldn't process your request.");
      } else {
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

  // Session management functions
  const createSession = useCallback(async (title?: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("Must be authenticated to create sessions");
      }
      setSessionError(null);
      const sessionTitle = title || `New Chat ${new Date().toLocaleTimeString()}`;
      const newSession = await createSessionAPI(sessionTitle);
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      dispatch({ type: "DELETE_ALL" }); // Clear current messages
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create session";
      setSessionError(errorMessage);
      console.error("Failed to create session:", error);
    }
  }, [createSessionAPI]);

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      setSessionError(null);
      const sessionsList = await getSessionsAPI();
      setSessions(sessionsList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load sessions";
      setSessionError(errorMessage);
      console.error("Failed to load sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, [getSessionsAPI]);

  const switchSession = useCallback(async (sessionId: string) => {
    try {
      setSessionError(null);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      setCurrentSession(session);
      
      // Load messages for this session
      const sessionMessages = await getSessionMessagesAPI(sessionId);
      const localMessages = sessionMessages.map(convertToLocalMessage);
      
      // Replace all messages with session messages
      dispatch({ type: "DELETE_ALL" });
      localMessages.forEach(msg => {
        dispatch({ type: "ADD_MESSAGE", payload: msg });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to switch session";
      setSessionError(errorMessage);
      console.error("Failed to switch session:", error);
    }
  }, [sessions, getSessionMessagesAPI]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setSessionError(null);
      await deleteSessionAPI(sessionId);
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleting current session, start new one
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        dispatch({ type: "DELETE_ALL" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete session";
      setSessionError(errorMessage);
      console.error("Failed to delete session:", error);
    }
  }, [deleteSessionAPI, currentSession]);

  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      setSessionError(null);
      await updateSessionTitleAPI(sessionId, title);
      
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? { ...s, title } : s)
      );
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update title";
      setSessionError(errorMessage);
      console.error("Failed to update session title:", error);
    }
  }, [updateSessionTitleAPI, currentSession]);

  const startNewSession = useCallback(() => {
    setCurrentSession(null);
    dispatch({ type: "DELETE_ALL" });
  }, []);

  // Mode controls (unchanged)
  const setModeToSettings = () => setMode("settings");
  const setModeToInput = () => setMode("input");
  const setModeToLoading = () => setMode("loading");

  // Load sessions on mount
  React.useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated()) {
        await loadSessions();
      }
    };
    loadInitialData();
  }, [loadSessions]);

  const value = useMemo(
    () => ({
      // Existing API
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
      
      // New session management API
      sessions,
      currentSession,
      loadingSessions,
      sessionError,
      createSession,
      loadSessions,
      switchSession,
      deleteSession,
      updateSessionTitle,
      startNewSession,
    }),
    [
      messages,
      mode,
      userInput,
      isBotFetching,
      sessions,
      currentSession,
      loadingSessions,
      sessionError,
      createSession,
      loadSessions,
      switchSession,
      deleteSession,
      updateSessionTitle,
      startNewSession,
    ]
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