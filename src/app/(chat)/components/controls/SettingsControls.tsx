"use client";

import { IconRefresh, IconBackspace, IconTrash } from "@tabler/icons-react";
import { useRef } from "react";
import { useChat } from "../../contexts/ChatContext";
import { createPortal } from "react-dom";

export default function SettingsMode() {
  const { setModeToInput } = useChat();
  const controlsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Backdrop */}
      {createPortal(
        <div
          className="fixed inset-0 w-screen h-screen bg-black/10 cursor-pointer z-1"
          onClick={() => setModeToInput()}
        />,
        document.body,
      )}

      {/* Content */}
      <div
        ref={controlsRef}
        className="fixed inset-x-4 bottom-4 z-[2] bg-primary flex items-center justify-around rounded-3xl px-4 py-4 shadow-lg"
      >
        <button className="py-2 text-text hover:text-hover-clr">
          <IconRefresh className="m-auto mb-2 w-6 h-6" />
          <span>Regenerate Last Chat</span>
        </button>

        <button
          className="py-2 text-text hover:text-hover-clr"
          aria-label="Delete last chat"
        >
          <IconBackspace className="m-auto mb-2 w-6 h-6" />
          <span>Delete Last Chat</span>
        </button>

        <button
          className="py-2 text-text hover:text-hover-clr"
          aria-label="Delete all chats"
        >
          <IconTrash className="m-auto mb-2 w-6 h-6" />
          <span>Delete All Chats</span>
        </button>
      </div>
    </>
  );
}
