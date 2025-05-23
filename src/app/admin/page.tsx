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
  IconDatabase,
  IconUpload,
  IconGlobe,
} from "@tabler/icons-react";
import { useRAG } from "@/app/admin/hooks/useRAG";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const VALID_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
] as const;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;
const MAX_FILES = 10;

type ValidFileType = (typeof VALID_TYPES)[number];
type ImageFileType = (typeof IMAGE_TYPES)[number];

type TabType = "upload" | "storage" | "websites";

type TabConfig = {
  id: TabType;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
};

export default function RAGAdminUI(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [newWebsite, setNewWebsite] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Use the RAG hooks
  const {
    files: storageFiles,
    websites,
    loading,
    error,
    uploadFiles,
    deleteFile,
    toggleFileVectorization,
    fetchFiles,
    addWebsite: addWebsiteHook,
    scrapeWebsite,
    deleteWebsite: deleteWebsiteHook,
    toggleWebsiteVectorization,
    fetchWebsites,
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
    if (newFiles.length + files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const validFiles = newFiles.filter((f) =>
      VALID_TYPES.includes(f.type as ValidFileType),
    );
    if (validFiles.length !== newFiles.length) {
      alert("Only JPEG, JPG, PNG, PDF files are supported.");
      return;
    }
    const uniqueFiles = validFiles.filter(
      (nf) =>
        !files.some(
          (f) => f.name === nf.name && f.size === nf.size && f.type === nf.type,
        ),
    );
    if (uniqueFiles.length !== validFiles.length) {
      alert("Duplicate files are not allowed.");
      return;
    }
    setFiles([...files, ...uniqueFiles]);
    setPreviews([
      ...previews,
      ...uniqueFiles
        .filter((f) => IMAGE_TYPES.includes(f.type as ImageFileType))
        .map(URL.createObjectURL),
    ]);
  };

  const handleUpload = async (): Promise<void> => {
    if (!files.length) {
      alert("No files selected.");
      return;
    }

    const result = await uploadFiles(files);

    if (result.success) {
      alert("Files uploaded successfully!");
      setFiles([]);
      setPreviews([]);
      // Clear file input
      if (fileInput.current) fileInput.current.value = "";
    } else {
      alert(`Upload failed: ${result.error}`);
    }
  };

  const handleClear = (index: number): void => {
    const file = files[index];
    setFiles(files.filter((_, i) => i !== index));
    if (IMAGE_TYPES.includes(file.type as ImageFileType)) {
      const previewUrl = previews[index];
      URL.revokeObjectURL(previewUrl);
      setPreviews(previews.filter((_, i) => i !== index));
    }
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handlePreview = (file: File, index: number): void => {
    if (IMAGE_TYPES.includes(file.type as ImageFileType)) {
      setPreview(previews[index]);
    } else {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const handleDeleteStorageFile = async (fileId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    const success = await deleteFile(fileId);
    if (success) {
      alert("File deleted successfully!");
    } else {
      alert("Error deleting file");
    }
  };

  const handleToggleFileVectorization = async (
    fileId: string,
    currentVectorized: boolean,
  ): Promise<void> => {
    await toggleFileVectorization(fileId, !currentVectorized);
  };

  const handleAddWebsite = async (): Promise<void> => {
    if (!newWebsite.trim()) return;

    try {
      new URL(newWebsite); // Validate URL
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    const result = await addWebsiteHook(newWebsite.trim());
    if (result) {
      setNewWebsite("");
    }
  };

  const handleScrapeWebsite = async (websiteId: string): Promise<void> => {
    const success = await scrapeWebsite(websiteId);
    if (success) {
      alert("Website scraped successfully!");
    } else {
      alert("Error scraping website");
    }
  };

  const handleDeleteWebsite = async (websiteId: string): Promise<void> => {
    if (!confirm("Are you sure you want to remove this website?")) return;

    const success = await deleteWebsiteHook(websiteId);
    if (!success) {
      alert("Error deleting website");
    }
  };

  const handleToggleWebsiteVectorization = async (
    websiteId: string,
    currentVectorized: boolean,
  ): Promise<void> => {
    await toggleWebsiteVectorization(websiteId, !currentVectorized);
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

  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  const tabs: TabConfig[] = [
    { id: "upload", name: "Upload Files", icon: IconUpload },
    { id: "storage", name: "Storage Files", icon: IconFile },
    { id: "websites", name: "Websites", icon: IconGlobe },
  ];

  const getStatusColor = (status: "success" | "pending" | "error"): string => {
    switch (status) {
      case "success":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "error":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen py-8 text-text-clr">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Display global error if any */}
          {/* {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )} */}

          <div className="bg-primary-clr/10 backdrop-blur-lg backdrop-grayscale border border-gray-500/20 shadow-md rounded-xl">
            <div className="">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-foreground-clr text-text-clr"
                        : "border-transparent text-text-clr hover:border-foreground-clr"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "upload" && (
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold text-text-clr mb-4">
                    Upload New Files
                  </h2>
                  <div
                    className="h-64 border-2 border-dashed border-gray-500 rounded-lg bg-foreground-clr/10 flex flex-col items-center justify-center hover:border-gray-600 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <IconPhoto size={48} className="text-text-clr mb-3" />
                    <p className="text-base font-medium text-text-clr mb-1">
                      Drag & Drop Files
                    </p>
                    <p className="text-sm text-text-clr mb-1">
                      or{" "}
                      <span
                        className="text-text-clr underline cursor-pointer hover:text-accent-clr"
                        onClick={() => fileInput.current?.click()}
                      >
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-text-clr">
                      Supports: JPEG, JPG, PNG, PDF
                    </p>
                    <input
                      type="file"
                      ref={fileInput}
                      onChange={handleFileInputChange}
                      accept={VALID_TYPES.join(",")}
                      multiple
                      className="hidden"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-sm font-medium text-text-clr">
                        Selected Files:
                      </h3>
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-background p-3 rounded-md border border-foreground-clr"
                        >
                          <div className="flex items-center space-x-2">
                            <IconFile size={16} className="text-text-clr" />
                            <span className="text-sm text-text-clr">
                              {file.name}
                            </span>
                            <span className="text-xs text-text-clr/80">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePreview(file, index)}
                              className="text-text-clr"
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
                        className="w-full mt-4 px-4 py-2 border border-foreground-clr/30 rounded-md text-sm text-text-clr hover:bg-foreground-clr/10 disabled:opacity-50 transition duration-200"
                      >
                        {loading ? "Uploading..." : "Upload Files"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "storage" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-clr">
                      Storage Files
                    </h2>
                    <button
                      onClick={fetchFiles}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-2 border border-foreground-clr/30 rounded-md text-sm text-text-clr hover:bg-foreground-clr/10 disabled:opacity-50 transition duration-200"
                    >
                      <IconRefresh size={16} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="bg-primary-clr/10 border border-gray-200/20 shadow-md overflow-hidden rounded-md">
                    {storageFiles.length === 0 ? (
                      <div className="px-6 py-8 text-center text-text-clr/60">
                        No files uploaded yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-foreground-clr/20">
                        {storageFiles.map((file) => (
                          <li key={file.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <IconFile size={20} className="text-text-clr" />
                                <div>
                                  <p className="text-sm font-medium text-text-clr">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-text-clr/80">
                                    {formatFileSize(file.size)} • Uploaded{" "}
                                    {formatDate(file.uploaded_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-text-clr/80">
                                    Vectorized:
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleToggleFileVectorization(
                                        file.id,
                                        file.vectorized,
                                      )
                                    }
                                    disabled={loading}
                                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                      file.vectorized
                                        ? "bg-text-clr"
                                        : "bg-foreground-clr/30"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-primary-clr transition-transform ${
                                        file.vectorized
                                          ? "translate-x-4"
                                          : "translate-x-0.5"
                                      }`}
                                    />
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteStorageFile(file.id)
                                  }
                                  className="text-red-500 hover:text-red-700"
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
                  </div>
                </div>
              )}

              {activeTab === "websites" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-text-clr mb-4">
                      Website Scraping
                    </h2>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        placeholder="Enter website URL (e.g., https://example.com)"
                        className="flex-1 px-3 py-2 border border-foreground-clr/30 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground-clr focus:border-background-clr bg-background-clr/20 text-text-clr"
                        disabled={loading}
                      />
                      <button
                        onClick={handleAddWebsite}
                        disabled={loading || !newWebsite.trim()}
                        className="flex items-center space-x-2 px-4 py-2 bg-background-clr/80 text-text-clr rounded-md hover:bg-background-clr/50 text-sm transition duration-200 disabled:opacity-50"
                      >
                        <IconPlus size={16} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-primary-clr/10 border border-gray-200/20 shadow-md overflow-hidden rounded-md">
                    {websites.length === 0 ? (
                      <div className="px-6 py-8 text-center text-text-clr/60">
                        No websites added yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-foreground-clr/20">
                        {websites.map((website) => (
                          <li key={website.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <IconWorld
                                  size={20}
                                  className="text-text-clr"
                                />
                                <div>
                                  <p className="text-sm font-medium text-text-clr">
                                    {website.url}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-text-clr/80">
                                    <span>
                                      Last scraped:{" "}
                                      {formatDate(website.last_scraped)}
                                    </span>
                                    {/* <span className={`px-2 py-1 rounded-full ${getStatusColor(website.status)}`}>
                                    {website.status}
                                  </span> */}
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
                                <button
                                  onClick={() =>
                                    handleScrapeWebsite(website.id)
                                  }
                                  disabled={
                                    loading || website.status === "pending"
                                  }
                                  className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                                  title="Scrape website"
                                >
                                  {/* <IconRefresh size={16} /> */}
                                </button>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-text-clr/80">
                                    Vectorized:
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleToggleWebsiteVectorization(
                                        website.id,
                                        website.vectorized,
                                      )
                                    }
                                    disabled={loading}
                                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                      website.vectorized
                                        ? "bg-text-clr"
                                        : "bg-foreground-clr/30"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-primary-clr transition-transform ${
                                        website.vectorized
                                          ? "translate-x-4"
                                          : "translate-x-0.5"
                                      }`}
                                    />
                                  </button>
                                </div>
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

          {preview && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-primary-clr p-4 rounded-lg max-w-4xl max-h-full overflow-auto shadow-xl">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain"
                />
                <button
                  onClick={() => setPreview(null)}
                  className="mt-4 w-full px-4 py-2 bg-background-clr text-white rounded hover:bg-accent-clr transition duration-200"
                >
                  Close Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
