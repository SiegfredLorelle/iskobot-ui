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
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const handleRecording = async (): Promise<void> => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
  
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        };
        
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } else {
        if (mediaRecorder) {
          mediaRecorder.stop();
          mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
              const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
              const url = URL.createObjectURL(audioBlob);
              setAudioUrl(url);
              setAudioChunks([]); // Reset chunks
            }
          };
  
          // Stop all tracks
          if (audioStream) {
            audioStream.getTracks().forEach((track) => track.stop());
            setAudioStream(null);
          }
        }
        setIsRecording(false);
      }
    } catch (err) {
      console.error("Error handling recording:", err);
      alert("Microphone access denied or other error.");
    }
  };

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
        onClick={message ? handleSend : handleRecording}
        aria-label={message ? "Send message" : "Record audio"}
        className="ml-2 py-2 text-text hover:text-hover-clr"
      >
        {message ? (
          <IconSend className="w-6 h-6" />
        ) : (
          <IconMicrophoneFilled 
            className={`w-6 h-6 ${isRecording ? "text-red-500" : ""}`}
          />
        )}
      </button>
    </div>
  );
}