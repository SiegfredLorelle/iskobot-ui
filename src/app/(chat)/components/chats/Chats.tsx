import { useChat } from "../../contexts/ChatContext";
import ChatBox from "./ChatBox";
import { useRef, useEffect, useState } from "react";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";

export default function Chats() {
  const { messages, mode } = useChat();
  const lastMessageRef = useRef("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;
  if (!endpoint) {
    throw new Error("Endpoint not initialized");
  }

  const handleToggleVoice = () => {
    setIsVoiceEnabled((prev) => !prev);
  };

  useEffect(() => {
    if (!isVoiceEnabled) return;

    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage.isUser && lastMessage.text !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.text;

        fetch(`${endpoint}/speech`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: lastMessage.text }),
        })
          .then((response) => {
            if (response.status === 204) return null;
            if (!response.ok)
              throw new Error(`Failed to generate speech: ${response.status}`);
            return response.blob();
          })
          .then((audioBlob) => {
            if (!audioBlob || audioBlob.size === 0) return;
            const audioBlobUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioBlobUrl);
            audio.onload = () => URL.revokeObjectURL(audioBlobUrl);
            audio.play();
          })
          .catch((error) => {
            console.error("Error generating or playing speech:", error);
          });
      }
    }
  }, [messages, isVoiceEnabled]);

  return (
    <div className="w-full mx-auto flex flex-col gap-4 pb-28">
      {/* Voice Toggle Button inline */}
      <div className="flex justify-end mb-4">
        <button
          className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
          onClick={handleToggleVoice}
          aria-label={`Turn voice ${isVoiceEnabled ? "off" : "on"}`}
          color="h-4 w-4 text-orange-500"
        >
          {isVoiceEnabled ? (
            <IconMicrophone className="h-4 w-4 text-orange-500" />
          ) : (
            <IconMicrophoneOff className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-orange-500">
            {isVoiceEnabled ? "Voice On" : "Voice Off"}
          </span>
        </button>
      </div>

      {messages.map((message, index) => (
        <ChatBox key={index} isUser={message.isUser} text={message.text} />
      ))}
      {mode === "loading" && <ChatBox text="..." />}
    </div>
  );
}
