"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconSend,
  IconMicrophoneFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useChat } from "../../contexts/ChatContext";
import { useAudioTranscription } from "../../hooks/useAudioTranscription";

export default function InputControls() {
  const { userInput, setUserInput, setModeToSettings, sendMessageToBot } =
    useChat();

  const { transcribeAudio, isTranscribing, transcriptionError } =
    useAudioTranscription();

  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleSettings = () => {
    setModeToSettings();
  };
  const handleSend = async () => {
    const trimmedMessage = userInput.trim();
    if (!trimmedMessage) return;
    sendMessageToBot(trimmedMessage);
    setUserInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRecording = async () => {
    try {
      if (!isRecording) {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setAudioStream(stream);

        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

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

            // Use the custom hook to transcribe audio
            const transcription = await transcribeAudio(formData);
            setUserInput(transcription || "");
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
    <div className="fixed inset-x-4 bottom-4 bg-primary-clr flex items-center rounded-3xl px-4 py-4 shadow-lg shadow-text-clr/30">
      {!userInput && !isRecording && (
        <button
          onClick={handleSettings}
          className="ml-2 mt-auto py-2 text-text-clr hover:text-hover-clr"
        >
          <IconDotsVertical className="w-6 h-6" />
        </button>
      )}
      <textarea
        autoFocus
        placeholder={
          isTranscribing ? "Transcribing..." : "Type your message..."
        }
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-primary-clr text-text-clr max-h-[45vh] text-center flex items-center placeholder-text-clr focus:outline-hidden resize-none px-3 leading-relaxed"
        rows={1}
        ref={textareaRef}
      />
      <button
        onClick={userInput ? handleSend : handleRecording}
        aria-label={
          userInput
            ? "Send message"
            : isRecording
              ? "Stop and download recording"
              : "Start recording"
        }
        className="ml-2 mt-auto py-2 text-text-clr hover:text-hover-clr"
      >
        {userInput ? (
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
