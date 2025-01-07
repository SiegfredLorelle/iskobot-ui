export default function ChatBox({ text }: ChatBoxProps) {
  // Regular expression to split text into chunks, keeping whole words
  const textChunks = text.match(/(?:\S+\s*){1,12}/g) || [];

  return (
    <div className="p-3 bg-primary text-text rounded-md">
      {textChunks.map((chunk, index) => (
        <p key={index}>{chunk}</p>
      ))}
    </div>
  );
}
