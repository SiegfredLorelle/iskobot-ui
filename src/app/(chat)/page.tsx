"use client";

import { useState } from "react";
import Link from "next/link";
import ChatBox from "./components/chats/ChatBox";
import Controls from "@/app/(chat)/components/controls/Controls";
import { ChatProvider } from "./contexts/ChatContext";
import Chats from "./components/chats/Chats";

export default function ChatPage() {
  // const [chats, setChats] = useState<{ text: string; isUser: boolean }[]>([]);
  // const addUserChat = (text: string) => {
  //   setChats((prev) => [...prev, { text: text, isUser: true }]);
  // };
  // const addBotChat = (text: string) => {
  //   setChats((prev) => [...prev, { text: text, isUser: false }]);
  // };

  return (
    <ChatProvider>
      <div className="my-3 px-3 flex w-full justify-center min-h-screen">
        <main className="max-w-2xl w-full mx-auto flex flex-col gap-8">
          <Chats />
          <Link href="/admin">Go Admin</Link>
        </main>
        <footer className="flex items-center justify-center">
          <Controls />
        </footer>
      </div>
    </ChatProvider>
  );
}
