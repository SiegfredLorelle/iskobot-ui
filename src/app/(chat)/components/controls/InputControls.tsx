"use client";

import { useState } from "react";
import {
  IconSend,
  IconMicrophoneFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useChat } from "../../contexts/ChatContext";
import { useFetchBotResponse } from "@/app/(chat)/hooks/useFetchBotResponse";

export default function InputControls() {
  const { fetchBotResponse } = useFetchBotResponse();
  const {
    setModeToLoading,
    setModeToInput,
    addUserChat,
    addBotChat,
    showTypingIndicator,
    hideTypingIndicator,
  } = useChat();

  const [message, setMessage] = useState("");

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    addUserChat(trimmedMessage);

    try {
      setModeToLoading();
      showTypingIndicator(); // Show typing indicator while bot is generating a response
      const response = await fetchBotResponse(trimmedMessage);
      hideTypingIndicator(); // Hide typing indicator after receiving the response
      addBotChat(response); // Add the bot's response
    } catch (err) {
      console.error("Failed to send message:", err);
      hideTypingIndicator(); // Ensure indicator is hidden even on error
    } finally {
      setModeToInput();
      setMessage(""); // Clear the textfield
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full w-full bg-primary flex items-center rounded-3xl px-4 py-4 shadow-lg mb-4">
      {!message ? (
        <button
          onClick={handleSend}
          className="ml-2 mt-auto py-2 text-text hover:text-hover-clr"
        >
          <IconDotsVertical className="w-6 h-6" />
        </button>
      ) : null}
      <textarea
        autoFocus
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={(e) => {
          const textarea = e.target as HTMLTextAreaElement;
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }}
        className="w-full bg-primary text-text max-h-[45vh] text-center flex items-center placeholder-text focus:outline-none resize-none px-3 leading-relaxed"
        rows={1}
      />
      <button
        onClick={handleSend}
        aria-label="Send message"
        className="ml-2 py-2 text-text hover:text-hover-clr"
      >
        {message ? (
          <IconSend className="w-6 h-6" />
        ) : (
          <IconMicrophoneFilled className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
