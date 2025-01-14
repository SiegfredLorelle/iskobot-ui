import { useState, useCallback } from "react";

export function useAudioTranscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(
    null
  );

  const transcribeAudio = useCallback(async (formData: FormData) => {
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

      // Extract the transcription text from the result
      let transcriptionText: string;

      if (typeof result === "string") {
        transcriptionText = result;
      } else if (typeof result === "object" && result !== null) {
        transcriptionText = result.transcription;
      } else {
        transcriptionText = String(result);
      }

      setTranscriptionResult(transcriptionText);
    } catch (error) {
      console.error("Error sending audio to server:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setError(errorMessage || "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { transcribeAudio, isLoading, error, transcriptionResult };
}
