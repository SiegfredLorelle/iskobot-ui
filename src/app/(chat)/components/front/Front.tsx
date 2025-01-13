import ChatBox from "../chats/ChatBox";
import SampleInquiries from "./SampleInquiries";

export default function Front() {
  return (
    <div className="flex flex-col gap-4">
      <ChatBox text="Hello! How may I help you today?" wide={true} />
      <SampleInquiries />
    </div>
  );
}