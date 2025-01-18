import ChatBubble from "@/app/(chat)/components/chats/ChatBubble";
import type { ChatBoxProps } from "@/app/(chat)/types/ChatBoxProps";

export default function ChatBox({
  text,
  isUser = false,
  wide = false,
}: ChatBoxProps) {
  return (
    <div className={`flex ${isUser ? "flex-row-reverse ml-auto" : "flex-row"}`}>
      { <ChatBubble isUser={isUser} />} {/* Only show ChatBubble if not isUser */}
      <div
        className={`p-3 bg-primary-clr shadow-md text-text-clr rounded-md ${isUser ? "me-2" : "ms-2"} ${wide ? "p-5 w-full text-2xl font-bold" : "p-4 max-w-md"} `}
      >
        <p>{text}</p>
      </div>
    </div>
  );
}
