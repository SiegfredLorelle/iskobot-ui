"use client";

import Image from "next/image";
import Link from "next/link";
import UserDropdown from "@/components/ui/HeaderDropdown";

export default function Header() {
  return (
    <header className="flex mx-4 my-3">
      <Logo />
      <UserDropdown />
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
        <span className=" font-[oxygen] font-bold text-lg hover:text-hover-clr">
          Iskobot
        </span>
      </Link>
    </h1>
  );
};
