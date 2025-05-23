import { useState } from "react";

export function useIngestion() {
  const [ingesting, setIngesting] = useState(false);
  const [ingestStats, setIngestStats] = useState<null | Record<string, any>>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null); // Add timestamp
  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const handleIngest = async () => {
    setIngesting(true);
    setError(null);
    setIngestStats(null); // Clear previous stats
    setCompletedAt(null); // Clear previous completion

    try {
      console.log("Starting ingestion..."); // Debug log

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
      console.log("Ingestion response:", data); // Debug log

      setIngestStats(data.stats);
      setCompletedAt(Date.now()); // Set completion timestamp
    } catch (err: any) {
      console.error("Ingestion error:", err); // Debug log
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
    completedAt, // Return completion timestamp
  };
}
