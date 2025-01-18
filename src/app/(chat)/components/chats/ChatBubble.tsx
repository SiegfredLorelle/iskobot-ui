export default function ChatBubble({ isUser }: { isUser?: boolean }) {
  return (
    <div className="bg-primary-clr shadow-md rounded-full w-8 h-8 mt-auto shrink-0 overflow-hidden flex items-center justify-center">
      {!isUser ? (
        <img
          src="/assets/icons/iskobot-logo.png"
          alt="Chat Avatar"
          className="w-full h-full object-cover"
        />
      ) : null}
    </div>
  );
}
