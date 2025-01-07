import Image from "next/image";
import Link from "next/link";
import ChatBox from "./components/ChatBox";

export default function Home() {
  return (
    <div className="m-3 flex flex-col justify-items-center">
      <main>
        <div className="flex flex-col gap-8">
          <ChatBox text="When you use curly braces {} in an arrow function, you need to explicitly use return to return a value. However, in your case, since you are returning JSX, you can omit the curly braces and use parentheses () for an implicit return."/>
          <ChatBox isUser={true} text="When you use curly braces {} in an arrow function, you need to explicitly use return to return a value. However, in your case, since you are returning JSX, you can omit the curly braces and use parentheses () for an implicit return."/>
          <ChatBox text="When you use curly braces {} in an arrow function, you need to explicitly use return to return a value. However, in your case, since you are returning JSX, you can omit the curly braces and use parentheses () for an implicit return."/>
        </div>
      </main>
      <footer className="mt-auto row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Link href="/admin">Go Admin</Link>
      </footer>
    </div>
  );
}
