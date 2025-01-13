import { useChat } from "../../contexts/ChatContext";
export default function SampleInquiry(props: { text: string }) {
  const { setUserInput } = useChat();
  const updateUserInput = () => {
    setUserInput(props.text);
  };

  return (
    <button 
      className="flex-shrink-0 w-64 h-64 mx-2 first:ml-0 last:mr-0 rounded-lg bg-primary"
      onClick={updateUserInput}
    >
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-center text-primary-foreground text-lg">{props.text}</p>
      </div>
  </button>
  )
}