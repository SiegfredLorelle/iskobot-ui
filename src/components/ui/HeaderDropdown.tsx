// components/UserDropdown.tsx
import { useState, useRef, useEffect } from "react";
import {
  IconMenu2,
  IconLogout,
  IconLogin,
  IconUser,
  IconHistory,
  IconBrain,
  IconSettings,
  IconMicrophone,
} from "@tabler/icons-react";
import ThemeToggle from "@/components/toggle/ThemeToggle";
import Link from "next/link";
import { useAuth } from "@/app/(auth)/hooks/useAuth";
import VoiceToggle from "@/components/toggle/VoiceToggle";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="ml-auto relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center p-2 text-text-clr rounded-md shadow-md bg-[var(--accent-clr)] hover:bg-[var(--accent-clr)]/80 focus:outline-none focus:ring-2 focus:ring-text-clr/80 transition duration-200"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <IconMenu2 className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-clr rounded-md shadow-md z-10">
          <div className="p-2 flex flex-col gap-1">
            <ThemeToggle />

            {isLoading ? (
              <div className="px-3 py-2 text-text-clr text-sm">Loading...</div>
            ) : isAuthenticated && user ? (
              <>
                {/* User Info Section */}
                <div className="px-3 py-2 border-b border-background-clr/20 mb-1">
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-text-clr" />
                    <div className="text-sm">
                      <div className="text-text-clr font-medium truncate">
                        {user.display_name || user.full_name || "User"}
                      </div>
                      <div className="text-text-clr/70 text-xs truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Toggle */}
                <VoiceToggle onToggle={() => {}} />

                {/* History Link */}
                <Link
                  href="/history"
                  className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-background-clr/80 rounded-md transition duration-200"
                  onClick={closeDropdown}
                >
                  <IconHistory className="h-4 w-4" />
                  History
                </Link>

                {/* Knowledge Link */}
                {(user.role === "admin" || user.role === "super_admin") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-background-clr/80 rounded-md transition duration-200"
                    onClick={closeDropdown}
                  >
                    <IconBrain className="h-4 w-4" />
                    Knowledge
                  </Link>
                )}

                {/* Account Management Link */}
                {user.role === "super_admin" && (
                  <Link
                    href="/admin/accounts"
                    className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-background-clr/80 rounded-md transition duration-200"
                    onClick={closeDropdown}
                  >
                    <IconSettings className="h-4 w-4" />
                    Account Management
                  </Link>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-text-clr text-sm hover:bg-background-clr/80 rounded-md transition duration-200 text-left"
                >
                  <IconLogout className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              // Unauthenticated User Options
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
                  onClick={closeDropdown}
                >
                  <IconLogin className="h-4 w-4" />
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
                  onClick={closeDropdown}
                >
                  <IconUser className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
