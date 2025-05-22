"use client";

import Image from "next/image";
import ThemeToggle from "@/components/theme/Toggle";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { IconMenu2 } from "@tabler/icons-react";


function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="ml-auto relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center p-2 text-text-clr rounded-md shadow-md hover:bg-background-clr/80 focus:outline-none focus:ring-2 focus:ring-text-clr/80 transition duration-200"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <IconMenu2 className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-clr rounded-md shadow-md z-10">
          <div className="p-2 flex flex-col gap-1">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="block px-3 py-2 text-text-clr text-sm hover:bg-background-clr/80 rounded-md transition duration-200"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="block px-3 py-2 text-text-clr text-sm hover:bg-background-clr/80 rounded-md transition duration-200"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

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
