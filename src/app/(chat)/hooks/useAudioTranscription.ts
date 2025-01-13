import { useState, useCallback } from "react";

export function useAudioTranscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptionResult, setTranscriptionResult] = useState(null);

  const transcribeAudio = useCallback(async (formData) => {
    const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT || "";

    setIsLoading(true);
    setError(null);
    setTranscriptionResult(null);

    try {
      const response = await fetch(`${endpoint}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send audio to server");
      }

      const result = await response.json();
      setTranscriptionResult(result);
      console.log("Transcription result:", result);
    } catch (error) {
      console.error("Error sending audio to server:", error);
      setError(error.message || "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { transcribeAudio, isLoading, error, transcriptionResult };
}
