'use client'

import Image from "next/image";
import { IconSunFilled, IconMoonFilled } from '@tabler/icons-react';
import { useTheme } from '@/components/theme/provider';

export default function Header() {
  return (
    <header className="flex mx-4 my-3">
      <Logo />
      <DarkMode />
    </header>
  )
}

const Logo = () => {
  return (
    <h1 className="inline-block">
      <a href="/" className="flex items-center gap-2">
        <Image 
          src="/assets/icons/vercel.svg"
          alt="Iskobot Logo"
          width={16}
          height={16}
        />
        <span className="text-lg">Iskobot</span>
      </a>
    </h1>
  )
};

const DarkMode = () => {
  const {   theme, toggleTheme } = useTheme();
  return (
    <button className="ms-auto" onClick={toggleTheme}>
      {
        theme === "light" ?
        (<IconMoonFilled />) :
        (<IconSunFilled />)
      }
    </button>
  )
};

