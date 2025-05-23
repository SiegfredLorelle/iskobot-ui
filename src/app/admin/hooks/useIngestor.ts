import { useState } from "react";

type IngestStats = Record<string, unknown>;

export function useIngestion() {
  const [ingesting, setIngesting] = useState(false);
  const [ingestStats, setIngestStats] = useState<IngestStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const handleIngest = async () => {
    setIngesting(true);
    setError(null);
    setIngestStats(null);
    setCompletedAt(null);

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
      setCompletedAt(Date.now());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to ingest data.";
      setError(message);
    } finally {
      setIngesting(false);
    }
  };

  return {
    handleIngest,
    ingestStats,
    ingesting,
    error,
    completedAt,
  };
}
