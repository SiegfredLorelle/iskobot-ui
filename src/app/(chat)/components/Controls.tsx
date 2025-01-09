"use client";

import { useState } from "react";
import {
  IconSend,
  IconMicrophoneFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useChat } from "@/app/(chat)/hooks/useChat";
import { ControlsProps } from "@/app/(chat)/types/ControlsProps";

export default function Controls({ addUserChat, addBotChat }: ControlsProps) {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const { getBotResponse, isLoading, error } = useChat();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {
    if (message.trim() === "") return;

    addUserChat(message);

    try {
      const response = await getBotResponse(message);
      setResponses((prev) => [...prev, response]);
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
      <div className="flex flex-col items-center bg-gray-700 rounded-2xl px-4 py-4 shadow-lg">
        {/* Input Field */}
        <div className="flex items-center w-full">
          {!message ? (
            <button
              onClick={handleSend}
              className="ml-2 mt-auto py-2 text-gray-300 hover:text-white"
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
            className="w-full bg-gray-700 text-gray-300 max-h-[45vh] text-center flex items-center placeholder-gray-400 focus:outline-none p-2 resize-none leading-relaxed"
            rows={1}
          />
          <button
            onClick={handleSend}
            className="ml-2 mt-auto py-2 text-gray-300 hover:text-white"
          >
            {message ? (
              <IconSend className="w-6 h-6" />
            ) : (
              <IconMicrophoneFilled className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
