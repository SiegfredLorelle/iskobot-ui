import ChatBubble from "@/app/(chat)/components/chats/ChatBubble";
import type { ChatBoxProps } from "@/app/(chat)/types/ChatBoxProps";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export default function ChatBox({
  text,
  isUser = false,
  wide = false,
}: ChatBoxProps) {
  return (
    <div className={`flex ${isUser ? "flex-row-reverse ml-auto" : "flex-row"}`}>
      <ChatBubble isUser={isUser} />
      <div
        className={`p-3 bg-primary-clr shadow-md text-text-clr rounded-md ${isUser ? "me-2" : "ms-2"} ${wide ? "p-5 w-full text-2xl font-bold" : "p-4 max-w-md"} `}
      >
        {isUser ? (
          // For user messages, display as plain text
          <p>{text}</p>
        ) : (
          // For bot messages, render as Markdown
          <div className="markdown-content">
            <ReactMarkdown
              rehypePlugins={[rehypeSanitize]} // Sanitize HTML to prevent XSS
              remarkPlugins={[remarkGfm]} // Support GitHub Flavored Markdown
            >
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
