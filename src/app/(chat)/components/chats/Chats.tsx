import { useChat } from "../../contexts/ChatContext";
import ChatBox from "./ChatBox";

export default function Chats() {
  const { chats, isBotTyping } = useChat();

  return (
    <div className="max-w-2xl w-full mx-auto flex flex-col gap-8 pb-24">
      {chats.map((chat, index) => (
        <ChatBox key={index} isUser={chat.isUser} text={chat.text} />
      ))}
      {isBotTyping && <ChatBox text={"..."} />}
    </div>
  );
}
