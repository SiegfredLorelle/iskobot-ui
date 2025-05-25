"use client";

import { SessionHistory } from "@/app/history/components/SessionHistory";
import { useChat, ChatProvider } from "@/app/(chat)/contexts/ChatContext";
import { useEffect } from "react";

export default function HistoryPage() {
  const { loadSessions } = useChat();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Chat History</h1>
        <SessionHistory />
      </div>
  );
}