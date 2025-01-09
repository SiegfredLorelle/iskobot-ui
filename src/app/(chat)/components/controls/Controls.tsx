"use client";

import InputControls from "@/app/(chat)/components/controls/InputControls"; 
import SettingsControls from "@/app/(chat)/components/controls/SettingsControls"; 
import LoadingControls from "@/app/(chat)/components/controls/LoadingControls"; 
import { useChat } from "../../contexts/ChatContext";
export default function Controls() {
  const { mode } = useChat();
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
      <div className="flex flex-col items-center bg-primary rounded-3xl px-4 py-4 shadow-lg">
        {mode === 'input' && <InputControls />}
        {mode === 'settings' && <SettingsControls />}
        {mode === 'loading' && <LoadingControls />}
      </div>
    </div>
  );
}
