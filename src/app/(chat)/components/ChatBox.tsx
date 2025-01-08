import ChatBubble from "@/app/(chat)/components/ChatBubble";
import { ChatBoxProps } from "@/app/(chat)/types/ChatBoxProps";

export default function ChatBox({ text, isUser = false }: ChatBoxProps) {
  return (
    <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <ChatBubble />
      <div className="p-3 bg-primary text-text rounded-md max-w-md">
        <p>{text}</p>
      </div>
    </div>
  );
}
