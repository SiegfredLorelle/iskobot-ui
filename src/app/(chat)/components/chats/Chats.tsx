import { useChat } from "../../contexts/ChatContext";
import ChatBox from "./ChatBox";
import { useEffect } from "react";

export default function Chats() {
  const { messages, mode } = useChat();

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1].text;

      // Send the last message text to your Python backend (e.g., FastAPI)
      fetch("http://localhost:8080/generate_speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: lastMessage,
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