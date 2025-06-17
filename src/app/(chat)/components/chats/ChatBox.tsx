import ChatBubble from "@/app/(chat)/components/chats/ChatBubble";
import type { ChatBoxProps } from "@/app/(chat)/types/ChatBoxProps";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";

export default function ChatBox({
  text,
  isUser = false,
  wide = false,
  timestamp,
}: ChatBoxProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp?: Date | string) => {
    if (!timestamp) return "";

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = currentTime;

    // Check if the message is from today
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // Show time for today's messages
      return date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      // Show date and time for older messages
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <div className={`flex ${isUser ? "flex-row-reverse ml-auto" : "flex-row"}`}>
      <ChatBubble isUser={isUser} />
      <div
        className={`flex flex-col ${isUser ? "items-end me-2" : "items-start ms-2"}`}
      >
        <div
          className={`p-3 bg-primary-clr shadow-md text-text-clr rounded-md ${wide ? "p-5 w-full text-2xl font-bold" : "p-4 max-w-md"} `}
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
        {timestamp && (
          <span className="text-xs text-gray-500 mt-1 px-1">
            {formatTimestamp(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
