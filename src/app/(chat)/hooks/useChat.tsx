// src/app/(chat)/hooks/useChat.ts
import { useState } from 'react';
import { useChatReturn } from '@/app/(chat)/types/useChatReturn';
import { useChatProps } from '@/app/(chat)/types/useChatProps';

export function useChat(): useChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBotResponse = async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    const endpoint = 'https://run-rag-116711660246.asia-east1.run.app/query';
    const query = { 
      query: "Give me a TLDR of the paper Attention is All You Need." 
    };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("GETTING RESPONSE ....");
      return data.response;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
      throw new Error(errorMessage);
      
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