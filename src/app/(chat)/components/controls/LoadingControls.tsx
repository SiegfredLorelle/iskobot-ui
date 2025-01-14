"use client";

import { IconPlayerStop } from "@tabler/icons-react";
import { useChat } from "../../contexts/ChatContext";

export default function LoadingMode() {
  const { setModeToInput } = useChat();

  const handleStopGenerating = () => {
    setModeToInput();
    // TODO: STOP FETCHING AS WELL
  };

  return (
    <button
      onClick={handleStopGenerating}
      className="fixed bottom-4 bg-primary-clr flex items-center rounded-3xl px-4 py-4 shadow-lg mt-auto text-text-clr hover:text-hover-clr shadow-text-clr/30"
    >
      <span>Stop Generating</span>
      <IconPlayerStop className="ml-2 w-6 h-6" stroke={2} />
    </button>
  );
}
