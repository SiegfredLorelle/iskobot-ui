export type Theme = 'dark' | 'light';

export type ThemeProviderState = {
  theme: Theme,
  toggleTheme: () => void,
}

export type ThemeProviderProps = {
  children: React.ReactNode,
  defaultTheme?: Theme,
  storageKey?: string,
}