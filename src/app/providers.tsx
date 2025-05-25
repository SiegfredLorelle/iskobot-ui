"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/app/(auth)/hooks/useAuth";
import { ChatProvider } from "@/app/(chat)/contexts/ChatContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
