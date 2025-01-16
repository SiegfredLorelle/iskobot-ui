import { useChat } from "../../contexts/ChatContext";
import ChatBox from "./ChatBox";
import { useRef, useEffect } from "react";

export default function Chats() {
  const { messages, mode } = useChat();
  const lastMessageRef = useRef("");

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Only generate speech for non-user messages (e.g., system responses)
      if (!lastMessage.isUser && lastMessage.text !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.text;

        // Send last message text for speech synthesis
        fetch("http://localhost:8080/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: lastMessage.text,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Speech generated successfully", data);
          })
          .catch((error) => {
            console.error("Error generating speech:", error);
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