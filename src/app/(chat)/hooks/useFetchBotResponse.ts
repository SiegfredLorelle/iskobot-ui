import { useState } from "react";

export function useFetchBotResponse() {
  const [isBotFetching, setIsBotFetching] = useState(false);
  const [botFetchingError, setBotFetchingError] = useState<string | null>(null);

  const fetchBotResponse = async (message: string): Promise<string> => {
    setIsBotFetching(true);
    setBotFetchingError(null);

    const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;
    if (!endpoint) {
      throw new Error("Endpoint not initialized");
    }

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
      setBotFetchingError(errorMessage);
      throw err;
    } finally {
      setIsBotFetching(false);
    }
  };

  return { fetchBotResponse, isBotFetching, botFetchingError };
}
