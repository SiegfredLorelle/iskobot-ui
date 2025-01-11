"use client";

import { useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { IoIosSend } from "react-icons/io";
import { TiMicrophone } from "react-icons/ti";
import { FaStop } from "react-icons/fa";
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
  const [isClicked, setIsClicked] = useState(false); // State to track button click
  const [isRecording, setIsRecording] = useState(false); // To manage recording state
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null); // To store the audio stream

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

  // Function to handle button click
  const handleRecording = (): void => {
    console.log("clicked");
    setIsClicked((prevState) => !prevState); // Toggle the clicked state
  };

  return (
    <div className="h-full w-full bg-primary flex items-center rounded-3xl px-4 py-4 shadow-lg mb-4">
      {!message ? (
        <button
          onClick={handleSend}
          className="ml-2 mt-auto py-2 text-text hover:text-hover-clr"
        >
          <HiDotsVertical className="w-6 h-6" />
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
        onClick={handleRecording}
        aria-label="Send or stop"
        className="ml-2 py-2 text-text hover:text-hover-clr"
      >
        {isClicked ? (
          <FaStop className="w-6 h-6 text-red-500" />
        ) : message ? (
          <IoIosSend className="w-6 h-6" />
        ) : (
          <TiMicrophone className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
