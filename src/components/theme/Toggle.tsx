'use client'

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { IconSunFilled, IconMoonFilled } from '@tabler/icons-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return;

  return (
    <button 
      className="ms-auto" 
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      {resolvedTheme === 'light' ? <IconMoonFilled /> : <IconSunFilled />}
    </button>
  )
}