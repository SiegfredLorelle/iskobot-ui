import { useState } from "react";

type IngestStats = {
  percentage?: number;
  message?: string;
  error?: string;
};

export function useIngestion() {
  const [ingesting, setIngesting] = useState(false);
  const [progress, setProgress] = useState<IngestStats>({});
  const [error, setError] = useState<string | null>(null);
  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const handleIngest = async () => {
    setIngesting(true);
    setError(null);
    setProgress({});

    try {
      const startResponse = await fetch(`${endpoint}/ingest`, {
        method: "POST",
      });
      if (!startResponse.ok) throw new Error("Failed to start ingestion");

      const eventSource = new EventSource(`${endpoint}/ingest/stream`);

      eventSource.addEventListener("progress", (event) => {
        const data = JSON.parse(event.data);
        setProgress({
          percentage: data.percentage,
          message: data.message,
        });
      });

      eventSource.addEventListener("complete", () => {
        eventSource.close();
        setIngesting(false);
      });

      eventSource.addEventListener("error", (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        eventSource.close();
        setIngesting(false);
        setError(data.error || "Ingestion failed");
      });

      eventSource.onerror = () => {
        eventSource.close();
        setIngesting(false);
        setError("Connection to ingestion progress failed");
      };
    } catch (err) {
      setIngesting(false);
      setError(err instanceof Error ? err.message : "Ingestion failed");
    }
  };
  return {
    handleIngest,
    progress,
    ingesting,
    error,
  };
}
