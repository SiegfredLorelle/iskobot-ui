"use client";

import React, { useRef, useState, useEffect, JSX } from "react";
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

const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"] as const;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;
const MAX_FILES = 10;

type ValidFileType = typeof VALID_TYPES[number];
type ImageFileType = typeof IMAGE_TYPES[number];

interface StorageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  vectorized: boolean;
}

interface Website {
  id: string;
  url: string;
  lastScraped: string | null;
  status: 'success' | 'pending' | 'error';
  vectorized: boolean;
}

type TabType = 'upload' | 'storage' | 'websites';

interface TabConfig {
  id: TabType;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
}

// Mock data for demonstration
const mockStorageFiles: StorageFile[] = [
  {
    id: '1',
    name: 'document1.pdf',
    size: 2048576,
    type: 'application/pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    vectorized: true
  },
  {
    id: '2',
    name: 'image1.jpg',
    size: 1024000,
    type: 'image/jpeg',
    uploadedAt: '2024-01-14T09:15:00Z',
    vectorized: false
  },
  {
    id: '3',
    name: 'report.pdf',
    size: 3145728,
    type: 'application/pdf',
    uploadedAt: '2024-01-13T14:20:00Z',
    vectorized: true
  },
];

const mockWebsites: Website[] = [
  {
    id: '1',
    url: 'https://example.com',
    lastScraped: '2024-01-15T08:00:00Z',
    status: 'success',
    vectorized: true
  },
  {
    id: '2',
    url: 'https://docs.example.com',
    lastScraped: '2024-01-14T12:30:00Z',
    status: 'success',
    vectorized: true
  },
  {
    id: '3',
    url: 'https://blog.example.com',
    lastScraped: null,
    status: 'pending',
    vectorized: false
  },
];

export default function RAGAdminUI(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>(mockStorageFiles);
  const [websites, setWebsites] = useState<Website[]>(mockWebsites);
  const [newWebsite, setNewWebsite] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const addFiles = (newFiles: File[]): void => {
    if (newFiles.length + files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const validFiles = newFiles.filter((f) => VALID_TYPES.includes(f.type as ValidFileType));
    if (validFiles.length !== newFiles.length) {
      alert("Only JPEG, JPG, PNG, PDF files are supported.");
      return;
    }
    const uniqueFiles = validFiles.filter(
      (nf) => !files.some((f) => f.name === nf.name && f.size === nf.size && f.type === nf.type)
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
    
    setLoading(true);
    const formData = new FormData();
    files.forEach((f, i) => formData.append(`file${i}`, f));
    
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      alert("Files uploaded successfully!");
      setFiles([]);
      setPreviews([]);
      // Refresh storage files list
      await fetchStorageFiles();
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    }
    setLoading(false);
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

  const fetchStorageFiles = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call to fetch files from Supabase
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      // In real implementation, this would fetch from your Supabase storage
      // const { data, error } = await supabase.storage.from('bucket').list();
    } catch (error) {
      console.error("Error fetching storage files:", error);
    }
    setLoading(false);
  };

  const deleteStorageFile = async (fileId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    setLoading(true);
    try {
      // Simulate API call to delete file from Supabase
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      setStorageFiles(storageFiles.filter(f => f.id !== fileId));
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
    }
    setLoading(false);
  };

  const toggleVectorization = async (fileId: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call to toggle vectorization
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      setStorageFiles(storageFiles.map(f =>
        f.id === fileId ? { ...f, vectorized: !f.vectorized } : f
      ));
    } catch (error) {
      console.error("Error toggling vectorization:", error);
    }
    setLoading(false);
  };

  const addWebsite = async (): Promise<void> => {
    if (!newWebsite.trim()) return;
    
    try {
      new URL(newWebsite); // Validate URL
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    const newSite: Website = {
      id: Date.now().toString(),
      url: newWebsite.trim(),
      lastScraped: null,
      status: 'pending',
      vectorized: false
    };

    setWebsites([...websites, newSite]);
    setNewWebsite('');
  };

  const scrapeWebsite = async (websiteId: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call to scrape website
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      setWebsites(websites.map(w =>
        w.id === websiteId
          ? { ...w, lastScraped: new Date().toISOString(), status: 'success' as const }
          : w
      ));
      alert("Website scraped successfully!");
    } catch (error) {
      console.error("Error scraping website:", error);
      setWebsites(websites.map(w =>
        w.id === websiteId
          ? { ...w, status: 'error' as const }
          : w
      ));
      alert("Error scraping website");
    }
    setLoading(false);
  };

  const deleteWebsite = (websiteId: string): void => {
    if (!confirm("Are you sure you want to remove this website?")) return;
    setWebsites(websites.filter(w => w.id !== websiteId));
  };

  const toggleWebsiteVectorization = async (websiteId: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call to toggle vectorization
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      setWebsites(websites.map(w =>
        w.id === websiteId ? { ...w, vectorized: !w.vectorized } : w
      ));
    } catch (error) {
      console.error("Error toggling vectorization:", error);
    }
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    addFiles([...e.dataTransfer.files]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    addFiles([...(e.target.files || [])]);
  };

  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  const tabs: TabConfig[] = [
    { id: 'upload', name: 'Upload Files', icon: IconUpload },
    { id: 'storage', name: 'Storage Files', icon: IconFile },
    { id: 'websites', name: 'Websites', icon: IconGlobe }
  ];

  const getStatusColor = (status: Website['status']): string => {
    switch (status) {
      case 'success':
        return 'bg-green-600 text-white'; // Darker green for success
      case 'pending':
        return 'bg-yellow-500 text-white'; // Orange-yellow for pending
      case 'error':
        return 'bg-red-600 text-white'; // Darker red for error
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="min-h-screen py-8 text-text-clr"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary-clr/10 backdrop-blur-lg backdrop-grayscale border border-gray-500/20 shadow-md rounded-xl">
          <div className="">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-foreground-clr text-text-clr'
                      : 'border-transparent text-text-clr hover:border-foreground-clr'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon size={16} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-text-clr mb-4">Upload New Files</h2>
                <div
                  className="h-64 border-2 border-dashed border-gray-500 rounded-lg bg-foreground-clr/10 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <IconPhoto size={48} className="text-text-clr mb-3" />
                  <p className="text-base font-medium text-text-clr mb-1">Drag & Drop Files</p>
                  <p className="text-sm text-text-clr mb-1">
                    or{" "}
                    <span
                      className="text-text-clr underline cursor-pointer hover:text-accent-clr"
                      onClick={() => fileInput.current?.click()}
                    >
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-text-clr">Supports: JPEG, JPG, PNG, PDF</p>
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
                    <h3 className="text-sm font-medium text-text-clr">Selected Files:</h3>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-3 rounded-md border border-foreground-clr">
                        <div className="flex items-center space-x-2">
                          <IconFile size={16} className="text-text-clr" />
                          <span className="text-sm text-text-clr">{file.name}</span>
                          <span className="text-xs text-text-clr/80">({formatFileSize(file.size)})</span>
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
                      className="w-full mt-4 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 order border-foreground-clr/30 rounded-md text-sm text-text-clr hover:bg-foreground-clr/10 border border-foreground-clr/30 rounded-md text-sm text-text-clr hover:bg-foreground-clr/10 disabled:opacity-50 transition duration-200"
                    >
                      {loading ? 'Uploading...' : 'Upload Files'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'storage' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-text-clr">Storage Files</h2>
                  <button
                    onClick={fetchStorageFiles}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 border border-foreground-clr/30 rounded-md text-sm text-text-clr hover:bg-foreground-clr/10 disabled:opacity-50 transition duration-200"
                  >
                    <IconRefresh size={16} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="bg-primary-clr/10 border border-gray-200/20 shadow-md overflow-hidden rounded-md">
                  <ul className="divide-y divide-foreground-clr/20">
                    {storageFiles.map((file) => (
                      <li key={file.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <IconFile size={20} className="text-text-clr" />
                            <div>
                              <p className="text-sm font-medium text-text-clr">{file.name}</p>
                              <p className="text-xs text-text-clr/80">
                                {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-text-clr/80">To Vectorized:</span>
                              <button
                                onClick={() => toggleVectorization(file.id)}
                                disabled={loading}
                                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                  file.vectorized ? 'bg-text-clr' : 'bg-foreground-clr/30'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-primary-clr transition-transform ${
                                    file.vectorized ? 'translate-x-4' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                            <button
                              onClick={() => deleteStorageFile(file.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete file"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'websites' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-text-clr mb-4">Website Scraping</h2>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      placeholder="Enter website URL (e.g., https://example.com)"
                      className="flex-1 px-3 py-2 border border-foreground-clr/30 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground-clr focus:border-background-clr bg-background-clr/20 text-text-clr"
                    />
                    <button
                      onClick={addWebsite}
                      className="flex items-center space-x-2 px-4 py-2 bg-background-clr/80 text-text-clr rounded-md hover:bg-background-clr/50 text-sm transition duration-200"
                    >
                      <IconPlus size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="bg-primary-clr/10 border border-gray-200/20 shadow-md overflow-hidden rounded-md">
                  <ul className="divide-y divide-foreground-clr/20">
                    {websites.map((website) => (
                      <li key={website.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <IconWorld size={20} className="text-text-clr" />
                            <div>
                              <p className="text-sm font-medium text-text-clr">{website.url}</p>
                              <div className="flex items-center space-x-4 text-xs text-text-clr/80">
                                <span>Last scraped: {formatDate(website.lastScraped)}</span>
                                <span className={`px-2 py-1 rounded-full ${getStatusColor(website.status)}`}>
                                  {website.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-text-clr/80">To Vectorized:</span>
                              <button
                                onClick={() => toggleWebsiteVectorization(website.id)}
                                disabled={loading}
                                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                  website.vectorized ? 'bg-text-clr' : 'bg-foreground-clr/30'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-primary-clr transition-transform ${
                                    website.vectorized ? 'translate-x-4' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                            <button
                              onClick={() => deleteWebsite(website.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Remove website"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
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
  );
}