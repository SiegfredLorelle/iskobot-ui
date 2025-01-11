"use client";

import { useState, useRef } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { IoIosSend } from "react-icons/io";
import { TiMicrophone } from "react-icons/ti";
import { FaStop, FaPlay, FaPause } from "react-icons/fa";
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
  const [isClicked, setIsClicked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    addUserChat(trimmedMessage);

    try {
      setModeToLoading();
      showTypingIndicator();
      const response = await fetchBotResponse(trimmedMessage);
      hideTypingIndicator();
      addBotChat(response);
    } catch (err) {
      console.error("Failed to send message:", err);
      hideTypingIndicator();
    } finally {
      setModeToInput();
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleRecording = async (): Promise<void> => {
    console.log("clicked");
  
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
  
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
  
        recorder.ondataavailable = (event) => {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        };
        
        recorder.start();
        setIsRecording(true);
        console.log("Recording started");
  
      } catch (err) {
        console.error("Microphone access denied", err);
        alert("Microphone access was denied. Please check your permissions.");
      }
    } else {
      if (mediaRecorder && audioStream) {
        mediaRecorder.stop();
        const tracks = audioStream.getTracks();
        tracks.forEach((track) => track.stop());
        setAudioStream(null);
        setIsRecording(false);
        console.log("Recording stopped");
  
        // Create a Blob with the current chunks
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioChunks([]);
      }
    }
  
    setIsClicked((prevState) => !prevState);
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
      {audioUrl && (
        <>
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={handleAudioEnded}
          />
          <button
            onClick={handlePlayPause}
            className="py-2 text-text hover:text-hover-clr"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <FaPause className="w-6 h-6 text-blue-500" />
            ) : (
              <FaPlay className="w-6 h-6 text-blue-500" />
            )}
          </button>
        </>
      )}
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