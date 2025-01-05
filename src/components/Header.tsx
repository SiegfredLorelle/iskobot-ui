import Image from "next/image";
import { IconSunFilled } from '@tabler/icons-react';

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
  return (
    <button className="ms-auto">
      <IconSunFilled />
    </button>
  )
};

