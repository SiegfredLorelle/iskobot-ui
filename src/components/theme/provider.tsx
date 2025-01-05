'use client'

import { createContext, useState, useEffect, useContext } from 'react';
import { Theme, ThemeProviderState, ThemeProviderProps } from '@/libs/types/theme';

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme='light',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Set theme to run on client side (after mounting, to prevent hydration error)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check local storage for saved preference
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme) {
        setTheme(storedTheme);
      } 
      else {
        // Check system preference if no theme is stored
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemPreference || defaultTheme);
      }
    }
  }, [defaultTheme, storageKey]);

  // Sync the theme state with localStorage and apply the theme to the document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme])


  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used with ThemeProvider')
  }
  return context;
}