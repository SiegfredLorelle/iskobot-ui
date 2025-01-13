import { useChat } from "../../contexts/ChatContext";
import ChatBox from "./ChatBox";

export default function Chats() {
  const { messages, mode } = useChat();

  return (
    <div className="max-w-2xl w-full mx-auto flex flex-col gap-8 pb-24">
      {messages.map((message, index) => (
        <ChatBox key={index} isUser={message.isUser} text={message.text} />
      ))}
      {mode === "loading" && <ChatBox text={"..."} />}
    </div>
  );
}
