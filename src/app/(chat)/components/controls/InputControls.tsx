"use client";

import { useState } from "react";
import {
  IconSend,
  IconMicrophoneFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useChat } from "../../contexts/ChatContext";
import { useFetchBotResponse } from "@/app/(chat)/hooks/useFetchBotResponse";

export default function InputMode() {
  const { fetchBotResponse, isLoading, error } = useFetchBotResponse();
  const { addUserChat, addBotChat } = useChat();

  const [message, setMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {
    if (message.trim() === "") return;

    addUserChat(message);

    try {
      const response = await fetchBotResponse(message);
      console.log(response);
      addBotChat(response);
      setMessage(""); // Clear input after successful send
    } catch (err) {
      // Error state is already handled in the hook
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && message.trim() !== "") {
      handleSend();
    }
  };

  return (
    <div className="flex items-center w-full">
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onInput={(e) => {
          const textarea = e.target as HTMLTextAreaElement;
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }}
        className="w-full bg-primary text-text max-h-[45vh] text-center flex items-center placeholder-text focus:outline-none p-2 resize-none leading-relaxed"
        rows={1}
      />
      <button
        onClick={handleSend}
        className="ml-2 mt-auto py-2 text-text hover:text-hover-clr"
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
