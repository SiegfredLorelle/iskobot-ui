// hooks/useRAG.ts
"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/app/(auth)/hooks/useAuth";

// Types
type StorageFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploaded_at: string;
  vectorized: boolean;
  user_id: string;
  public_url?: string;
};

type Website = {
  id: string;
  url: string;
  last_scraped: string | null;
  status: "success" | "pending" | "error";
  vectorized: boolean;
  user_id: string;
  created_at: string;
  error_message?: string;
};

type UploadResponse = {
  success: boolean;
  files?: StorageFile[];
  error?: string;
};

type ApiError = {
  detail: string | { msg: string }[];
  message?: string;
};

// Custom hook for file management
export function useFileManagement() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const handleApiError = (error: ApiError): string => {
    if (error.detail) {
      if (Array.isArray(error.detail) && error.detail.length > 0) {
        return error.detail[0].msg || "An error occurred";
      }
      return typeof error.detail === "string"
        ? error.detail
        : JSON.stringify(error.detail);
    }
    return error.message || "An unexpected error occurred";
  };

  // Fetch all files
  const fetchFiles = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/rag/files`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(handleApiError(errorData));
      }

      const data: StorageFile[] = await response.json();
      setFiles(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  }, [token, endpoint]);

  // Upload files
  const uploadFiles = useCallback(
    async (fileList: File[]): Promise<UploadResponse> => {
      if (!token) {
        return { success: false, error: "Not authenticated" };
      }

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        fileList.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch(`${endpoint}/rag/files/upload`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(handleApiError(errorData));
        }

        const uploadedFiles: StorageFile[] = await response.json();

        // Update local state
        setFiles((prev) => [...uploadedFiles, ...prev]);

        return { success: true, files: uploadedFiles };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token, endpoint],
  );

  // Delete file
  const deleteFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      if (!token) return false;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${endpoint}/rag/files/${fileId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(handleApiError(errorData));
        }

        // Update local state
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error deleting file:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, endpoint],
  );

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFiles,
    deleteFile,
  };
}

// Custom hook for website management
export function useWebsiteManagement() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const handleApiError = (error: ApiError): string => {
    if (error.detail) {
      if (Array.isArray(error.detail) && error.detail.length > 0) {
        return error.detail[0].msg || "An error occurred";
      }
      return typeof error.detail === "string"
        ? error.detail
        : JSON.stringify(error.detail);
    }
    return error.message || "An unexpected error occurred";
  };
  // Fetch all websites
  const fetchWebsites = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/rag/websites`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(handleApiError(errorData));
      }

      const data: Website[] = await response.json();
      setWebsites(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching websites:", err);
    } finally {
      setLoading(false);
    }
  }, [token, endpoint]);

  // Add website
  const addWebsite = useCallback(
    async (url: string): Promise<Website | null> => {
      if (!token) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${endpoint}/rag/websites`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(handleApiError(errorData));
        }

        const newWebsite: Website = await response.json();

        // Update local state
        setWebsites((prev) => [newWebsite, ...prev]);

        return newWebsite;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error adding website:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, endpoint],
  );

  // Delete website
  const deleteWebsite = useCallback(
    async (websiteId: string): Promise<boolean> => {
      if (!token) return false;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${endpoint}/rag/websites/${websiteId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(handleApiError(errorData));
        }

        // Update local state
        setWebsites((prev) => prev.filter((site) => site.id !== websiteId));
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error deleting website:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, endpoint],
  );

  return {
    websites,
    loading,
    error,
    fetchWebsites,
    addWebsite,
    deleteWebsite,
  };
}

// Combined hook for RAG management
export function useRAG() {
  const fileManagement = useFileManagement();
  const websiteManagement = useWebsiteManagement();

  // Combined loading state
  const loading = fileManagement.loading || websiteManagement.loading;

  // Combined error state
  const error = fileManagement.error || websiteManagement.error;

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fileManagement.fetchFiles(),
      websiteManagement.fetchWebsites(),
    ]);
  }, [fileManagement.fetchFiles, websiteManagement.fetchWebsites]);

  return {
    // File management
    files: fileManagement.files,
    uploadFiles: fileManagement.uploadFiles,
    deleteFile: fileManagement.deleteFile,
    fetchFiles: fileManagement.fetchFiles,

    // Website management
    websites: websiteManagement.websites,
    addWebsite: websiteManagement.addWebsite,
    deleteWebsite: websiteManagement.deleteWebsite,
    fetchWebsites: websiteManagement.fetchWebsites,

    // Combined states
    loading,
    error,
    refreshAll,
  };
}
