"use client";

import Link from "next/link";
import Controls from "@/app/(chat)/components/controls/Controls";
import { ChatProvider, useChat } from "./contexts/ChatContext";
import Chats from "./components/chats/Chats";
import Front from "./components/front/Front";

const ChatContent = () => {
  const { messages } = useChat();
  return <div>{messages.length === 0 ? <Front /> : <Chats />}</div>;
};

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="my-9 px-3 flex w-full justify-center">
        <div className="absolute -translate-y-20 translate-x-80 opacity-50 blur-[120px]">
          <div className="w-0 h-0 rotate-45 border-l-[500px] border-l-transparent border-b-[350px] border-b-text-clr border-r-[500px] border-r-transparent"></div>
        </div>
        <main className="lg:max-w-4xl w-full mx-auto flex flex-col gap-8 z-1">
          <ChatContent />
          <Link href="/admin">Go Admin</Link>
        </main>
        <footer className="flex items-center justify-center">
          <Controls />
        </footer>
      </div>
    </ChatProvider>
  );
}
