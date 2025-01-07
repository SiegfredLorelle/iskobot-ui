import Image from "next/image";
import Link from "next/link";
import ChatBox from "./components/ChatBox";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <ChatBox isUser={true} text="When you use curly braces {} in an arrow function, you need to explicitly use return to return a value. However, in your case, since you are returning JSX, you can omit the curly braces and use parentheses () for an implicit return."/>
        <Link href="/admin">Go Admin</Link>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
