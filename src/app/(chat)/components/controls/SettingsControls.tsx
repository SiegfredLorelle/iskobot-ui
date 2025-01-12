"use client";

import { IconRefresh, IconBackspace, IconTrash } from "@tabler/icons-react";
import { useRef } from "react";
import { useChat } from "../../contexts/ChatContext";
import { createPortal } from "react-dom";

export default function SettingsMode() {
  const { messages, sendMessageToBot, setModeToInput, deleteAllMessage, deleteLastMessage } = useChat();
  const controlsRef = useRef<HTMLDivElement>(null);

  const handleSettingsClose = () => {
    setModeToInput();
  };
  const handleRegenerate = () => {
    const lastUserChat = messages.at(-2);
    if (!lastUserChat) {
      console.warn("No user message found to regenerate response");
      return;
    }
    if (messages.length > 0 && !messages[messages.length - 1].isUser) {
      deleteLastMessage();
      deleteLastMessage();
    }
    sendMessageToBot(lastUserChat.text);
  };

  const handleDeleteLastMessage = () => {
    deleteLastMessage();
    deleteLastMessage();
    setModeToInput();
  };
  const  handleDeleteAllMessage = () => {
    deleteAllMessage();
    setModeToInput();
  };

  const isMessagesEmpty = messages.length === 0;

  return (
    <>
      {/* Backdrop */}
      {createPortal(
        <div
          className="fixed inset-0 w-screen h-screen bg-black/10 cursor-pointer z-1"
          onClick={handleSettingsClose}
          />,
          document.body,
        )}

      {/* Content */}
      <div
        ref={controlsRef}
        className="fixed inset-x-4 bottom-4 z-[2] bg-primary flex items-center justify-around rounded-3xl px-4 py-4 shadow-lg"
        >
        <button className="py-2 text-text hover:text-hover-clr disabled:opacity-50 disabled:cursor-not-allowed" 
        onClick={handleRegenerate}
        disabled={isMessagesEmpty}
        >
          <IconRefresh className="m-auto mb-2 w-6 h-6" />
          <span>Regenerate Last Chat</span>
        </button>

        <button
          className="py-2 text-text hover:text-hover-clr disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Delete last chat"
          onClick={handleDeleteLastMessage}
          disabled={isMessagesEmpty}

          >
          <IconBackspace className="m-auto mb-2 w-6 h-6" />
          <span>Delete Last Chat</span>
        </button>

        <button
          className="py-2 text-text hover:text-hover-clr disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Delete all chats"
          onClick={handleDeleteAllMessage}
          disabled={isMessagesEmpty}
        >
          <IconTrash className="m-auto mb-2 w-6 h-6" />
          <span>Delete All Chats</span>
        </button>
      </div>
    </>
  );
}
