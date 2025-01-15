import { useState, useCallback } from "react";

export function useAudioTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );
  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  if (!endpoint) {
    throw new Error("Endpoint not initialized");
  }

  const transcribeAudio = useCallback(
    async (formData: FormData) => {
      setIsTranscribing(true);
      setTranscriptionError(null);

      try {
        const response = await fetch(`${endpoint}/transcribe`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorData}`,
          );
        }

        const data = await response.json();

        if (!data.transcription) {
          throw new Error("Response data is missing expected format");
        }
        return String(data.transcription);
      } catch (error) {
        console.error("Error sending audio to server:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setTranscriptionError(errorMessage || "Unknown error occurred");
      } finally {
        setIsTranscribing(false);
      }
    },
    [endpoint],
  );

  return { transcribeAudio, isTranscribing, transcriptionError };
}
