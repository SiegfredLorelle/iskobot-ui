import ChatBox from "../chats/ChatBox";

export default function Front() {
  return (
    <div>
      <ChatBox text="Hello! How may I help you today?" wide={true} />
    </div>
  );
}