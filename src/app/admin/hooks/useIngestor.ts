import { useState } from "react";

export function useIngestion() {
  const [ingesting, setIngesting] = useState(false);
  const [ingestStats, setIngestStats] = useState<null | Record<string, any>>(null);
  const [error, setError] = useState<string | null>(null);
  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const handleIngest = async () => {
    setIngesting(true);
    setError(null);
    try {
      const response = await fetch(`${endpoint}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIngestStats(data.stats);
    } catch (err: any) {
      setError(err.message || "Failed to ingest data.");
    } finally {
      setIngesting(false);
    }
  };

  return {
    handleIngest,
    ingestStats,
    ingesting,
    error,
  };
}
