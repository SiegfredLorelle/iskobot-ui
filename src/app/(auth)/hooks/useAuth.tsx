"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import type { AuthStateType } from "@/app/(auth)/types/AuthStateType";
import type { UserType } from "@/app/(auth)/types/UserType";

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    full_name: string,
    display_name?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserType>) => Promise<void>;
} & AuthStateType;

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthStateType>({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;
  if (!endpoint) {
    throw new Error("Endpoint not initialized");
  }

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const refreshToken = localStorage.getItem("refresh_token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setAuthState({
            user,
            token,
            refreshToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        clearAuthState();
      }
    };

    loadAuthState();
  }, []);

  // Clear auth state
  const clearAuthState = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Save auth state to localStorage
  const saveAuthState = useCallback(
    (token: string, refreshToken: string | null, user: UserType) => {
      localStorage.setItem("auth_token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(user));

      setAuthState({
        user,
        token,
        refreshToken,
        isLoading: false,
        isAuthenticated: true,
      });
    },
    [],
  );

  // Sign in
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const response = await fetch(`${endpoint}/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
            // Extract the 'msg' from the first error object in the array
            throw new Error(errorData.detail[0].msg || "Sign in failed");
          } else {
            throw new Error(errorData.detail || "Sign in failed");
          }
        }

        const data = await response.json();

        if (data.access_token && data.user) {
          saveAuthState(data.access_token, data.refresh_token, data.user);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [endpoint, saveAuthState],
  );

  // Sign up
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      full_name: string,
      display_name?: string,
    ) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const response = await fetch(`${endpoint}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            full_name,
            display_name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
            // Extract the 'msg' from the first error object in the array
            throw new Error(errorData.detail[0].msg || "Sign up failed");
          } else {
            throw new Error(errorData.detail || "Sign up failed");
          }
        }

        const data = await response.json();

        // Handle case where email confirmation is required
        if (data.access_token && data.user) {
          saveAuthState(data.access_token, data.refresh_token, data.user);
        } else {
          // Just set loading to false, user needs to confirm email
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }

        return data.message;
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [endpoint, saveAuthState],
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      if (authState.token) {
        await fetch(`${endpoint}/auth/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      clearAuthState();
    }
  }, [endpoint, authState.token, clearAuthState]);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      if (!authState.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${endpoint}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: authState.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      if (data.access_token) {
        const updatedAuthState = {
          ...authState,
          token: data.access_token,
          refreshToken: data.refresh_token || authState.refreshToken,
        };

        localStorage.setItem("auth_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        setAuthState(updatedAuthState);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuthState();
      throw error;
    }
  }, [endpoint, authState, clearAuthState]);

  // Forgot password
  const forgotPassword = useCallback(
    async (email: string) => {
      const response = await fetch(`${endpoint}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Password reset failed");
      }

      return await response.json();
    },
    [endpoint],
  );

  // Update profile
  const updateProfile = useCallback(
    async (data: Partial<UserType>) => {
      if (!authState.token) {
        throw new Error("Not authenticated");
      }

      // This would depend on your backend implementation
      // You might need to add an update profile endpoint
      console.log("Update profile:", data);
      // Implementation depends on your backend endpoints
    },
    [authState.token],
  );

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshAccessToken,
    forgotPassword,
    updateProfile,
  };

  // This was missing in your original code!
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
