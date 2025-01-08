"use client";

import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { useChat } from "@/app/(chat)/hooks/useChat";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const { getBotResponse, isLoading, error } = useChat();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {
    if (message.trim() === "") return;

    try {
      const response = await getBotResponse(message);
      setResponses((prev) => [...prev, response]);
      console.log(response);
      setMessage(""); // Clear input after successful send
    } catch (err) {
      // Error state is already handled in the hook
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && message.trim() !== "") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
      <div className="flex flex-col items-center bg-gray-700 rounded-2xl px-4 py-4 shadow-lg">
        {/* Input Field */}
        <div className="flex items-center w-full">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="ml-2 text-gray-300 hover:text-white"
          >
            <IconSend className="w-6 h-6 rotate-45" />
          </button>
        </div>

        {/* Chatbox Buttons */}
        <div className="flex items-center justify-between w-full mt-3">
          <button className="text-gray-300 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button className="text-gray-300 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m2 0a2 2 0 10-2-2h-4a2 2 0 100 4h4a2 2 0 11-2 2H9a2 2 0 102 2"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
