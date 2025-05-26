import { useChat } from "../../contexts/ChatContext";
import ChatBox from "./ChatBox";
import { useRef, useEffect } from "react";

export default function Chats() {
  const { messages, mode } = useChat();
  const lastMessageRef = useRef("");

  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;
  if (!endpoint) {
    throw new Error("Endpoint not initialized");
  }

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage.isUser && lastMessage.text !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.text;

        // Send last message text for speech synthesis
        fetch(`${endpoint}/speech`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: lastMessage.text }),
        })
          .then((response) => {
            if (response.status === 204) {
              // No content returned, skip processing
              return null;
            }
            if (!response.ok) {
              throw new Error(`Failed to generate speech: ${response.status}`);
            }
            return response.blob();
          })
          .then((audioBlob) => {
            if (!audioBlob) {
              // Handle 204 case or null blob
              return;
            }

            if (audioBlob.size === 0) {
              throw new Error("Received empty audio blob");
            }

            // Play the audio directly
            const audioBlobUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioBlobUrl);

            audio.onload = () => {
              URL.revokeObjectURL(audioBlobUrl);
            };

            return audio.play();
          })
          .catch((error) => {
            console.error("Error generating or playing speech:", error);
          });
      }
    }
  }, [messages]);

  return (
    <div className="w-full mx-auto flex flex-col gap-4 pb-28">
      {messages.map((message, index) => (
        <ChatBox key={index} isUser={message.isUser} text={message.text} />
      ))}
      {mode === "loading" && <ChatBox text="..." />}
    </div>
  );
}
