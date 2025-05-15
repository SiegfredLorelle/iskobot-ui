import { useState, useRef } from "react";

export const useFetchBotResponse = () => {
  const [isBotFetching, setIsBotFetching] = useState(false);
  const [botFetchingError, setBotFetchingError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBotResponse = async (message: string): Promise<string> => {
    setIsBotFetching(true);
    setBotFetchingError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

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
        signal: controller.signal,
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
      // Check if this is an abort error
      if (err instanceof DOMException && err.name === "AbortError") {
        console.info("Request was cancelled by user");
        throw new Error("Request cancelled");
      }

      // Handle other errors as before
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setBotFetchingError(errorMessage);
      throw err;
    } finally {
      // Clear the controller reference if this is the current request
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsBotFetching(false);
    }
  };

  const cancelFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsBotFetching(false);
  };

  return { fetchBotResponse, cancelFetch, isBotFetching, botFetchingError };
};
