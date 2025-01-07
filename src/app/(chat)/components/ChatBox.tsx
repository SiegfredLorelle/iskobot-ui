import ChatBubble from "./ChatBubble";

interface ChatBoxProps {
  text: string;
}

export default function ChatBox({ text }: ChatBoxProps) {
  return (
    <div className="flex">
      <ChatBubble />
      <div className="p-3 bg-primary text-text rounded-md max-w-md">
        {<p>{text}</p>}
      </div>
    </div>
  );
}