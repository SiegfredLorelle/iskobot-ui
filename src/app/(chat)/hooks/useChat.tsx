// src/app/(chat)/hooks/useChat.ts
import { useState } from "react";
import { useChatReturn } from "@/app/(chat)/types/useChatReturn";

export function useChat(): useChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBotResponse = async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    // You can switch between local and production endpoints
    const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT || "";
    console.log(endpoint);

    try {
      const response = await fetch(`${endpoint}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData}`,
        );
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error("Response data is missing expected format");
      }

      return data.response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      throw err; // Re-throw the error to handle it in the component
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getBotResponse,
  };
}
