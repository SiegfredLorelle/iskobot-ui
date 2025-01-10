import { useChat } from "../../contexts/ChatContext";
import ChatBox from "./ChatBox";

export default function Chats() {
  const { chats, isBotTyping } = useChat();

  return (
    <div className="max-w-2xl w-full mx-auto flex flex-col gap-8 pb-24">
      {chats.map((chat, index) => (
        <ChatBox key={index} isUser={chat.isUser} text={chat.text} />
      ))}
      {isBotTyping && (
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-full w-8 h-8"></div>
          <div className="p-3 bg-primary text-text rounded-md max-w-md">
            <p>...</p>
          </div>
        </div>
      )}
    </div>
  );
}
