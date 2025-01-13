import { useState } from "react";

export function useFetchBotResponse() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBotResponse = async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT || "";
    try {
      const response = await fetch(`${endpoint}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
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
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchBotResponse, isLoading, error };
}
