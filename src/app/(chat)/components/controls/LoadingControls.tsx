"use client";

import { IconPlayerStop } from "@tabler/icons-react";
import { useChat } from "../../contexts/ChatContext";

export default function LoadingMode() {
  const { stopGenerating } = useChat();

  return (
    <button
      onClick={stopGenerating}
      className="fixed bottom-4 bg-primary-clr flex items-center rounded-3xl px-4 py-4 shadow-lg text-text-clr hover:text-hover-clr shadow-text-clr/30"
    >
      <span>Stop Generating</span>
      <IconPlayerStop className="ml-2 w-6 h-6" stroke={2} />
    </button>
  );
}
