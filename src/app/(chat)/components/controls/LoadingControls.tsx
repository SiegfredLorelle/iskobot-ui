"use client";

import { IconPlayerStop } from "@tabler/icons-react";

export default function LoadingMode() {
  return (
    <button className="h-full bg-primary flex items-center items-center rounded-3xl px-4 py-4 shadow-lg flex items-center ml-2 mt-auto py-2 text-text flex hover:text-hover-clr">
      <span>Stop Generating</span>
      <IconPlayerStop className="ml-2 w-6 h-6" stroke={2} />
    </button>
  );
}
