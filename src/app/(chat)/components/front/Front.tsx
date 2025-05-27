import ChatBox from "../chats/ChatBox";
import SampleInquiries from "./SampleInquiries";
import { useAuth } from "@/app/(auth)/hooks/useAuth";

export default function Front() {
  const { user } = useAuth();

  // Safely handle user greeting
  const greeting = user
    ? `Hello, ${user.display_name || user.full_name || "How may I help you today?"}!`
    : "Hello, How may I help you today?";

  return (
    <div className="flex flex-col gap-4">
      <ChatBox text={greeting} wide={true} />
      <SampleInquiries />
    </div>
  );
}
