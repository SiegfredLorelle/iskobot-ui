import React from "react";
import { IconPhoto } from "@tabler/icons-react";

export default function UploadPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative text-center p-5 w-full max-w-2xl bg-white shadow-md rounded-lg mx-4">
        <h2 className="absolute left-5 text-base text-gray-700">
          Upload your File:
        </h2>

        <div className="mt-8 h-96 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 flex flex-col items-center justify-center">
          <IconPhoto size={50} className="text-blue-600 mb-3" />

          <p className="text-base font-bold text-gray-700 mb-1">Drag & Drop</p>

          <p className="text-sm text-gray-700 mb-1">
            or{" "}
            <span className="text-blue-600 underline cursor-pointer">
              browse
            </span>
          </p>

          <p className="text-xs text-gray-500">Supports: JPEG, JPG, PNG</p>
        </div>
      </div>
    </div>
  );
}
