import Image from "next/image";
import ThemeToggle from "@/components/theme/Toggle";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex mx-4 my-3">
      <Logo />
      <ThemeToggle />
    </header>
  );
}

const Logo = () => {
  return (
    <h1 className="inline-block">
      <Link href="/" className=" flex items-center gap-2">
        <Image
          src="/assets/icons/iskobot-logo.png"
          alt="Iskobot Logo"
          width={44}
          height={44}
        />
        <span className=" font-[oxygen] font-bold text-lg hover:text-hover-clr">Iskobot</span>
      </Link>
    </h1>
  );
};
