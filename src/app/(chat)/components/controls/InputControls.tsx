"use client";

import { useState } from "react";
import {
  IconSend,
  IconMicrophoneFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useChat } from "../../contexts/ChatContext";

export default function InputControls() {
  const { setModeToSettings, sendMessageToBot } = useChat();

  const handleSettings = () => {
    setModeToSettings();
  };

  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    sendMessageToBot(trimmedMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRecording = async (): Promise<void> => {
    try {
      if (!isRecording) {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setAudioStream(stream);

        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        recorder.onstop = async () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: "audio/wav" });

            // Create FormData to send audio file to the server
            const formData = new FormData();
            formData.append(
              "audio_file",
              audioBlob,
              `recording-${new Date().toISOString()}.wav`,
            );

            // TODO: CREATE A CUSTOM HOOK FOR THIS, SIMILAR TO useFetchBotRespone
            const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT || "";
            console.log(endpoint);
            try {
              const response = await fetch(`${endpoint}/transcribe`, {
                method: "POST",
                body: formData, // The audio file in FormData
              });

              if (!response.ok) {
                throw new Error("Failed to send audio to server");
              }

              const result = await response.json();
              console.log("Transcription result:", result);
            } catch (error) {
              console.error("Error sending audio to server:", error);
              alert("Error sending audio to server.");
            }
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } else {
        // Stop recording
        if (mediaRecorder) {
          mediaRecorder.stop();
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

  return (
    <div className="h-full w-full bg-primary flex items-center rounded-3xl px-4 py-4 shadow-lg mb-4">
      {!message && !isRecording && (
        <button
          onClick={handleSettings}
          className="ml-2 mt-auto py-2 text-text hover:text-hover-clr"
        >
          <IconDotsVertical className="w-6 h-6" />
        </button>
      )}
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
        aria-label={
          message
            ? "Send message"
            : isRecording
              ? "Stop and download recording"
              : "Start recording"
        }
        className="ml-2 mt-auto py-2 text-text hover:text-hover-clr"
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
