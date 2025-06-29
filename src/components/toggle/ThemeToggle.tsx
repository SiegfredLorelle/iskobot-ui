// In ThemeToggle.jsx
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconSunFilled, IconMoonFilled } from "@tabler/icons-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const buttonLabel = `Switch to ${resolvedTheme === "light" ? "dark" : "light"}`;

  return (
    <button
      className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      aria-label={buttonLabel}
      title={buttonLabel}
    >
      {resolvedTheme === "light" ? (
        <IconMoonFilled className="h-5 w-5" />
      ) : (
        <IconSunFilled className="h-5 w-5" />
      )}
      <span>{resolvedTheme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}
