"use client";

import React, { useRef, useState, useEffect } from "react";
import { IconPhoto, IconX } from "@tabler/icons-react";

const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILES = 3;

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
    if (newFiles.length + files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const validFiles = newFiles.filter((f) => VALID_TYPES.includes(f.type));
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
        .filter((f) => IMAGE_TYPES.includes(f.type))
        .map(URL.createObjectURL),
    ]);
  };

  const handleUpload = async () => {
    if (!files.length) return alert("No files selected.");
    const formData = new FormData();
    files.forEach((f, i) => formData.append(`file${i}`, f));
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      alert(response.ok ? "Files uploaded successfully!" : "Upload failed.");
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    }
  };

  const handleClear = (index: number) => {
    const file = files[index];
    setFiles(files.filter((_, i) => i !== index));
    if (IMAGE_TYPES.includes(file.type)) {
      const previewUrl = previews[index];
      URL.revokeObjectURL(previewUrl);
      setPreviews(previews.filter((_, i) => i !== index));
    }
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handlePreview = (file: File, index: number) => {
    if (IMAGE_TYPES.includes(file.type)) {
      setPreview(previews[index]);
    } else {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative text-center p-5 w-full max-w-2xl bg-white shadow-md rounded-lg mx-4">
        <h2 className="absolute left-5 text-base text-gray-700">
          Upload your Files:
        </h2>
        <div
          className="mt-8 h-96 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 flex flex-col items-center justify-center"
          onDrop={(e) => {
            e.preventDefault();
            addFiles([...e.dataTransfer.files]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <IconPhoto size={50} className="text-blue-600 mb-3" />
          <p className="text-base font-bold text-gray-700 mb-1">Drag & Drop</p>
          <p className="text-sm text-gray-700 mb-1">
            or{" "}
            <span
              className="text-blue-600 underline cursor-pointer"
              onClick={() => fileInput.current?.click()}
            >
              browse
            </span>
          </p>
          <p className="text-xs text-gray-500">Supports: JPEG, JPG, PNG, PDF</p>
          <input
            type="file"
            ref={fileInput}
            onChange={(e) => addFiles([...(e.target.files || [])])}
            accept={VALID_TYPES.join(",")}
            multiple
            className="hidden"
          />
          {files.length > 0 && (
            <div className="flex flex-col items-center justify-center mt-2 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center">
                  <p
                    className="text-sm text-blue-600 underline cursor-pointer"
                    onClick={() => handlePreview(file, index)}
                  >
                    {file.name}
                  </p>
                  <button
                    onClick={() => handleClear(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    aria-label="Remove selected file"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {preview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-96"
                />
                <button
                  onClick={() => setPreview(null)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleUpload}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload Files
        </button>
      </div>
    </div>
  );
}
