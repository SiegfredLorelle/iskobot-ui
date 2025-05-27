"use client";

import type { JSX } from "react";
import React, { useRef, useState, useEffect } from "react";
import {
  IconPhoto,
  IconX,
  IconFile,
  IconTrash,
  IconEye,
  IconDownload,
  IconWorld,
  IconPlus,
  IconRefresh,
  IconGlobe,
} from "@tabler/icons-react";
import { useRAG } from "@/app/admin/hooks/useRAG";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { useIngestion } from "@/app/admin/hooks/useIngestor";
import { toast } from "react-hot-toast";

const VALID_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.openxmlformats-officedocument.presentationml.presentation" // PPTX
] as const;
type ValidFileType = (typeof VALID_TYPES)[number];

const ITEMS_PER_PAGE = 10;

type TabType = "files" | "websites";

type TabConfig = {
  id: TabType;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
};

// Move IngestButton outside to prevent re-creation
function IngestButton() {
  const { handleIngest, ingestStats, ingesting, error } = useIngestion();

  useEffect(() => {
    if (ingestStats) {
      toast.dismiss();
      toast.success("Ingestion complete! 🎉");
    }
  }, [ingestStats]);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(`Ingestion failed!`);
    }
  }, [error]);

  const runWithToast = async () => {
    // Show confirmation dialog with warning
    const confirmed = window.confirm(
      `⚠️ Ingestion and vectorization may take several hours, depending on the number of files and websites. During this process, Iskobot will be temporarily unavailable for answering questions. 😔

This process will:
• Extract content from all uploaded files
• Scrape all listed websites
• Generate vector embeddings for search
• Cannot be paused or stopped once started

Do you want to continue?`,
    );

    if (!confirmed) return;

    toast.loading("Ingestion started...");
    await handleIngest();
  };

  return (
    <div>
      <button
        onClick={runWithToast}
        disabled={ingesting}
        className="mt-6 w-full py-3 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-background-clr to-black hover:from-black hover:to-accent-clr transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {ingesting
          ? "Ingesting..."
          : "Ingest and Vectorize All Files and Websites for Iskobot's Knowledge"}
      </button>
    </div>
  );
}

export default function RAGAdminUI(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("files");
  const [files, setFiles] = useState<File[]>([]);
  const [newWebsite, setNewWebsite] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  // Use the RAG hooks
  const {
    files: storageFiles,
    websites,
    loading,
    error,
    uploadFiles,
    downloadFile,
    deleteFile,
    fetchFiles,
    addWebsite: addWebsiteHook,
    deleteWebsite: deleteWebsiteHook,
    deleteAllFiles,
    fetchWebsites,
    deleteAllFilesWithProgress,
    refreshAll,
  } = useRAG();

  // Load data on component mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never";
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString()
    );
  };

const addFiles = (newFiles: File[]): void => {
  const validFiles = newFiles.filter((f) =>
    VALID_TYPES.includes(f.type as ValidFileType)
  );
  
  if (validFiles.length !== newFiles.length) {
    toast.error("Only PDF, DOCX, and PPTX files are supported.");
    return;
  }

  const uniqueFiles = validFiles.filter((nf) =>
    !files.some((f) => 
      f.name === nf.name && 
      f.size === nf.size && 
      f.type === nf.type
    )
  );

  if (uniqueFiles.length !== validFiles.length) {
    toast.error("Duplicate files are not allowed.");
    return;
  }

  setFiles([...files, ...uniqueFiles]);
};

  const handleUpload = async (): Promise<void> => {
    if (!files.length) {
      toast.error("No files selected.")
      return;
    }

    const result = await uploadFiles(files);

    if (result.success) {
      toast.success("Files uploaded successfully!");
      setFiles([]);
      // Clear file input
      if (fileInput.current) fileInput.current.value = "";
    } else {
      toast.error(`Upload failed: ${result.error}`);
    }
  };

  const handleClear = (index: number): void => {
    setFiles(files.filter((_, i) => i !== index));
    if (fileInput.current) fileInput.current.value = "";
  };

  const handlePreview = (file: File): void => {
    window.open(URL.createObjectURL(file), "_blank");
  };

  const handleDeleteStorageFile = async (fileId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    const success = await deleteFile(fileId);
    if (!success) {
      toast.error("Error deleting file");
    }
  };

  const handleAddWebsite = async (): Promise<void> => {
    if (!newWebsite.trim()) return;

    try {
      new URL(newWebsite); // Validate URL
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    const result = await addWebsiteHook(newWebsite.trim());
    if (result) {
      setNewWebsite("");
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    const result = await downloadFile(fileId, fileName);

    if (result.success) {
      toast.success("File downloaded successfully!");
    } else {
      toast.error(`Failed to download file: ${result.error}`);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const handleDeleteAll = async () => {
    const fileCount = storageFiles.length;

    if (fileCount === 0) {
      toast.error("No files to delete");
      return;
    }

    // Enhanced confirmation dialog
    const confirmed = window.confirm(
      `⚠️ DELETE ALL FILES WARNING ⚠️

This will permanently delete ALL ${fileCount} uploaded files from both storage and the database.

This action:
• Cannot be undone
• Will remove all files immediately
• May affect the chatbot's knowledge base until re-ingestion

Are you absolutely sure you want to continue?`,
    );

    if (!confirmed) return;

    const userInput = window.prompt(
      "Type 'DELETE' (in capital letters) to confirm:",
    );
    if (userInput !== "DELETE") {
      toast.error("Deletion cancelled");
      return;
    }

    setIsDeleting(true);
    toast.loading(`Deleting ${fileCount} files...`);

    try {
      // Use the enhanced version with progress tracking
      const result = await deleteAllFilesWithProgress((progress) => {
        setDeleteProgress(progress);
          toast.loading(
            `Deleting files... ${progress.current}/${progress.total}`,
          );
      });

      toast.dismiss();

      if (result.success) {
        if (result.errors.length > 0) {
          toast.success(
            `Deleted ${result.deletedCount} files with ${result.errors.length} warnings`,
          );
          console.warn("Deletion warnings:", result.errors);
        } else {
          toast.success(
            `Successfully deleted all ${result.deletedCount} files! 🗑️`,
          );
        }
        await fetchFiles(); // Refresh the list
      } else {
        const errorMessage =
          result.errors.length > 0
            ? result.errors.slice(0, 2).join(", ") +
              (result.errors.length > 2 ? "..." : "")
            : "Unknown error occurred";
        toast.error(`Failed to delete files. ${errorMessage}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An unexpected error occurred while deleting files");
      console.error("Delete all files error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteProgress(null);
    }
  };

  const handleDeleteWebsite = async (websiteId: string): Promise<void> => {
    if (!confirm("Are you sure you want to remove this website?")) return;

    const success = await deleteWebsiteHook(websiteId);
    if (!success) {
    toast.error("Error deleting website");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    addFiles([...e.dataTransfer.files]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    addFiles([...(e.target.files || [])]);
  };

  const tabs: TabConfig[] = [
    { id: "files", name: "Files", icon: IconFile },
    { id: "websites", name: "Websites", icon: IconGlobe },
  ];

  const PaginationControls = () => {
    const totalPages = Math.ceil(storageFiles.length / itemsPerPage);

    return (
      <div className="flex items-center justify-center my-4 gap-3">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-foreground-clr/30 rounded-md text-sm hover:bg-foreground-clr/10 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-admin-clr">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-foreground-clr/30 rounded-md text-sm hover:bg-foreground-clr/10 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <AdminProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="min-h-screen py-8 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-clr backdrop-blur-lg backdrop-grayscale border border-gray-500/20 shadow-md rounded-xl">
            <div className="">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-foreground-clr "
                        : "border-transparent  hover:border-foreground-clr"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "files" && (
                <div>
                  {/* Upload Section */}
                  <div className="max-w-2xl mx-auto mb-8">
                    <h2 className="text-xl font-bold  mb-4">
                      Upload New Files
                    </h2>
                    <div
                      className="h-64 border-2 border-dashed border-gray-500 rounded-lg bg-foreground-clr/10 flex flex-col items-center justify-center hover:border-gray-600 transition-colors"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <IconPhoto size={48} className=" mb-3" />
                      <p className="text-base font-medium  mb-1">
                        Drag & Drop Files
                      </p>
                      <p className="text-sm  mb-1">
                        or{" "}
                        <span
                          className=" underline cursor-pointer hover:text-accent-clr"
                          onClick={() => fileInput.current?.click()}
                        >
                          browse
                        </span>
                      </p>
                      <p className="text-xs ">Supports: PDF, DOCX, PPTX</p>
                      <input
                        type="file"
                        ref={fileInput}
                        onChange={handleFileInputChange}
                        accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        multiple
                        className="hidden"
                      />
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h3 className="text-sm font-medium ">
                          Selected Files:
                        </h3>
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-background p-3 rounded-md border border-foreground-clr"
                          >
                            <div className="flex items-center space-x-2">
                              <IconFile size={16} className="" />
                              <span className="text-sm ">{file.name}</span>
                              <span className="text-xs /80">
                                ({formatFileSize(file.size)})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePreview(file)}
                                className=""
                                title="Preview"
                              >
                                <IconEye size={16} />
                              </button>
                              <button
                                onClick={() => handleClear(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove"
                              >
                                <IconX size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={handleUpload}
                          disabled={loading}
                          className="w-full mt-4 px-4 py-2 border border-foreground-clr/30 rounded-md text-sm  hover:bg-foreground-clr/10 disabled:opacity-50 transition duration-200"
                        >
                          {loading ? "Uploading..." : "Upload Files"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Storage Files Section */}
                  {deleteProgress && (
                    <div className="mt-2 text-xs text-admin-clr/60">
                      Progress: {deleteProgress.current} of{" "}
                      {deleteProgress.total} files deleted
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold ">Uploaded Files</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={fetchFiles}
                          disabled={loading}
                          className="flex items-center space-x-2 px-3 py-2 border border-foreground-clr/30 rounded-md text-sm  hover:bg-foreground-clr/10 disabled:opacity-50 transition duration-200"
                        >
                          <IconRefresh size={16} />
                          <span>Refresh</span>
                        </button>
                        <button
                          onClick={handleDeleteAll}
                          disabled={
                            loading || isDeleting || storageFiles.length === 0
                          }
                          className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm transition duration-200 ${
                            storageFiles.length === 0
                              ? "border-gray-500/30 text-gray-500/50 cursor-not-allowed"
                              : "border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                          }`}
                        >
                          <IconTrash size={16} />
                          <span>
                            {isDeleting
                              ? deleteProgress
                                ? `Deleting... ${deleteProgress.current}/${deleteProgress.total}`
                                : "Deleting..."
                              : `Delete All (${storageFiles.length})`}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-primary-clr/10 border border-gray-200/20 shadow-md overflow-hidden rounded-md">
                      {storageFiles.length === 0 ? (
                        <div className="px-6 py-8 text-center /60">
                          No files uploaded yet.
                        </div>
                      ) : (
                        <ul className="divide-y divide-foreground-clr/20">
                          {storageFiles
                            .slice(
                              (currentPage - 1) * itemsPerPage,
                              currentPage * itemsPerPage,
                            )
                            .map((file) => (
                              <li key={file.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <IconFile size={20} className="" />
                                    <div>
                                      <p className="text-sm font-medium ">
                                        {file.name}
                                      </p>
                                      <p className="text-xs /80">
                                        {formatFileSize(file.size)} • Uploaded{" "}
                                        {formatDate(file.uploaded_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={() =>
                                        handleDownloadFile(file.id, file.name)
                                      }
                                      className="text-admin-clr hover:text-accent-clr transition-colors"
                                      title="Download"
                                      disabled={loading}
                                    >
                                      <IconDownload size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteStorageFile(file.id)
                                      }
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                      title="Delete file"
                                      disabled={loading}
                                    >
                                      <IconTrash size={16} />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                      {storageFiles.length > itemsPerPage && (
                        <PaginationControls />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "websites" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold  mb-4">
                      Website Scraping
                    </h2>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        placeholder="Enter website URL (e.g., https://example.com)"
                        className="flex-1 px-3 py-2 border border-foreground-clr/30 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground-clr focus:border-background-clr bg-background-clr/20 "
                        disabled={loading}
                      />
                      <button
                        onClick={handleAddWebsite}
                        disabled={loading || !newWebsite.trim()}
                        className="flex items-center space-x-2 px-4 py-2 bg-background-clr/80  rounded-md hover:bg-background-clr/50 text-sm transition duration-200 disabled:opacity-50"
                      >
                        <IconPlus size={16} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-primary-clr/10 border border-gray-200/20 shadow-md overflow-hidden rounded-md">
                    {websites.length === 0 ? (
                      <div className="px-6 py-8 text-center /60">
                        No websites added yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-foreground-clr/20">
                        {websites.map((website) => (
                          <li key={website.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <IconWorld size={20} className="" />
                                <div>
                                  <p className="text-sm font-medium ">
                                    {website.url}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs /80">
                                    <span>
                                      Last scraped:{" "}
                                      {formatDate(website.last_scraped)}
                                    </span>
                                    {website.error_message && (
                                      <span
                                        className="text-red-500"
                                        title={website.error_message}
                                      >
                                        Error
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2"></div>
                                <button
                                  onClick={() =>
                                    handleDeleteWebsite(website.id)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove website"
                                  disabled={loading}
                                >
                                  <IconTrash size={16} />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <IngestButton />
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
