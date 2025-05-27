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

type DownloadResponse = {
  success: boolean;
  error?: string;
};

type DeleteAllResponse = {
  success: boolean;
  deletedCount: number;
  errors: string[];
  totalFiles?: number;
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

  // Download file
  const downloadFile = useCallback(
    async (fileId: string, fileName: string): Promise<DownloadResponse> => {
      if (!token) {
        return { success: false, error: "Not authenticated" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${endpoint}/rag/files/${fileId}/download`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          },
        );

        if (!response.ok) {
          let errorMessage = `Download failed: ${response.status} ${response.statusText}`;
          try {
            const errorData: ApiError = await response.json();
            errorMessage = handleApiError(errorData);
          } catch {
            // If we can't parse JSON, use the status text
            const errorText = await response.text();
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
          throw new Error(errorMessage);
        }

        // Get the blob from response
        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("Downloaded file is empty");
        }

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.style.display = "none";

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup after a short delay
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 100);

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error downloading file:", err);
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

  // Simple delete all files (fallback)
  const deleteAllFiles = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError("Not authenticated");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Try the batch endpoint first
      const response = await fetch(`${endpoint}/rag/files/batch`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // If batch endpoint doesn't exist, fall back to individual deletions
        if (response.status === 404) {
          console.log(
            "Batch endpoint not found, deleting files individually...",
          );

          const deletePromises = files.map(async (file) => {
            try {
              const fileResponse = await fetch(
                `${endpoint}/rag/files/${file.id}`,
                {
                  method: "DELETE",
                  headers: getAuthHeaders(),
                },
              );
              return fileResponse.ok;
            } catch {
              return false;
            }
          });

          const results = await Promise.all(deletePromises);
          const successCount = results.filter(Boolean).length;

          if (successCount > 0) {
            setFiles([]);
            return true;
          } else {
            throw new Error("Failed to delete files individually");
          }
        }

        const errorData: ApiError = await response.json();
        throw new Error(handleApiError(errorData));
      }

      // Parse the batch response
      const result = await response.json();

      // Clear local state if any files were deleted
      if (result.deleted_count > 0) {
        setFiles([]);
      }

      return result.success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete all files";
      setError(errorMessage);
      console.error("Error deleting all files:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, endpoint, files]);

  // Enhanced version with progress tracking
  const deleteAllFilesWithProgress = useCallback(
    async (
      onProgress?: (progress: {
        current: number;
        total: number;
        fileName?: string;
      }) => void,
    ): Promise<DeleteAllResponse> => {
      if (!token) {
        setError("Not authenticated");
        return {
          success: false,
          deletedCount: 0,
          errors: ["Not authenticated"],
        };
      }

      setLoading(true);
      setError(null);

      try {
        const currentFiles = files.length;

        if (currentFiles === 0) {
          return { success: true, deletedCount: 0, errors: [] };
        }

        // Try the batch endpoint first
        const response = await fetch(`${endpoint}/rag/files/batch`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          // Batch endpoint exists and worked
          const result = await response.json();

          // Update progress if callback provided
          if (onProgress) {
            onProgress({
              current: result.deleted_count || result.deletedCount,
              total: result.total_files || currentFiles,
            });
          }

          // Clear local state if any files were deleted
          if (result.deleted_count > 0 || result.deletedCount > 0) {
            setFiles([]);
          }

          return {
            success: result.success,
            deletedCount: result.deleted_count || result.deletedCount,
            errors: result.errors || [],
            totalFiles: result.total_files || currentFiles,
          };
        } else {
          // Fall back to individual deletions with progress tracking
          console.log(
            "Using individual file deletion with progress tracking...",
          );

          let deletedCount = 0;
          const errors: string[] = [];

          // Update initial progress
          if (onProgress) {
            onProgress({ current: 0, total: currentFiles });
          }

          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
              const fileResponse = await fetch(
                `${endpoint}/rag/files/${file.id}`,
                {
                  method: "DELETE",
                  headers: getAuthHeaders(),
                },
              );

              if (fileResponse.ok) {
                deletedCount++;
              } else {
                const errorData = await fileResponse.json();
                errors.push(
                  `Failed to delete ${file.name}: ${handleApiError(errorData)}`,
                );
              }
            } catch (err) {
              errors.push(
                `Failed to delete ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }

            // Update progress
            if (onProgress) {
              onProgress({
                current: i + 1,
                total: currentFiles,
                fileName: file.name,
              });
            }
          }

          // Clear local state if any files were deleted
          if (deletedCount > 0) {
            setFiles([]);
          }

          return {
            success: deletedCount > 0,
            deletedCount,
            errors,
            totalFiles: currentFiles,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete all files";
        setError(errorMessage);
        console.error("Error deleting all files:", err);
        return { success: false, deletedCount: 0, errors: [errorMessage] };
      } finally {
        setLoading(false);
      }
    },
    [token, endpoint, files],
  );

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFiles,
    downloadFile,
    deleteFile,
    deleteAllFiles,
    deleteAllFilesWithProgress,
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
    downloadFile: fileManagement.downloadFile,
    deleteFile: fileManagement.deleteFile,
    fetchFiles: fileManagement.fetchFiles,
    deleteAllFiles: fileManagement.deleteAllFiles,
    deleteAllFilesWithProgress: fileManagement.deleteAllFilesWithProgress,

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
