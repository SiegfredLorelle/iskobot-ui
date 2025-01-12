"use client";

import { IconRefresh, IconBackspace, IconTrash } from "@tabler/icons-react";

export default function SettingsMode() {

  return (
    <div className="h-full w-full bg-primary flex items-center justify-around rounded-3xl px-4 py-4 shadow-lg mb-4">
        <button
          // onClick={}
          className="mt-auto py-2 text-text hover:text-hover-clr"
        >
          <IconRefresh className="m-auto mb-2 w-6 h-6" />
          <span>Regenerate Last Chat</span>
        </button>

      <button
        // onClick={}
        aria-label="Send message"
        className="py-2 text-text hover:text-hover-clr"
        >
        <IconBackspace className="m-auto mb-2 w-6 h-6" />
        <span>Delete Last Chat</span>
      </button>
      
      <button
        // onClick={}
        aria-label="Send message"
        className="py-2 text-text hover:text-hover-clr"
        >
        <IconTrash className="m-auto mb-2 w-6 h-6" />
        <span>Delete All Chats</span>
      </button>
    </div>
  );
}
