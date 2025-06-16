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
  IconUserCircle,
} from "@tabler/icons-react";
import ThemeToggle from "@/components/toggle/ThemeToggle";
import Link from "next/link";
import { useAuth } from "@/app/(auth)/hooks/useAuth";

export default function UserDropdown() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      {/* Menu Dropdown */}
      <div className="relative" ref={menuDropdownRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center p-2 text-text-clr rounded-md shadow-md bg-[var(--accent-clr)] hover:bg-[var(--accent-clr)]/80 focus:outline-none focus:ring-2 focus:ring-text-clr/80 transition duration-200"
          aria-expanded={isMenuOpen}
          aria-label="Main menu"
        >
          <IconMenu2 className="h-5 w-5" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-primary-clr rounded-md shadow-md z-10">
            <div className="p-2 flex flex-col gap-1">
              <ThemeToggle />

              {isLoading ? (
                <div className="px-3 py-2 text-text-clr text-sm">Loading...</div>
              ) : isAuthenticated && user ? (
                <>
                  {/* Navigation Links */}
                  <Link
                    href="/history"
                    className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconHistory className="h-4 w-4" />
                    History
                  </Link>

                  {/* Admin Links */}
                  {(user.role === "admin" || user.role === "super_admin") && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconBrain className="h-4 w-4" />
                      Knowledge
                    </Link>
                  )}

                  {user.role === "super_admin" && (
                    <Link
                      href="/admin/accounts"
                      className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconSettings className="h-4 w-4" />
                      Account Management
                    </Link>
                  )}
                </>
              ) : (
                // Unauthenticated User Options
                <>
                  <Link
                    href="/sign-in"
                    className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconLogin className="h-4 w-4" />
                    Sign In
                  </Link>

                  <Link
                    href="/sign-up"
                    className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
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

      {/* User Dropdown */}
      {isAuthenticated && user && (
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setIsUserOpen(!isUserOpen)}
            className="flex items-center justify-center w-9 h-9 text-text-clr rounded-md shadow-md bg-[var(--accent-clr)] hover:bg-[var(--accent-clr)]/80 focus:outline-none focus:ring-2 focus:ring-text-clr/80 transition duration-200"
            aria-expanded={isUserOpen}
            aria-label="User profile"
          >
            <IconUserCircle className="h-7 w-7" />
          </button>

          {isUserOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-primary-clr rounded-md shadow-md z-10">
              <div className="p-3">
                {/* User Info Section */}
                <div className="flex items-center gap-3 pb-3 border-b border-background-clr/20">
                  <div className="w-10 h-10 bg-[var(--accent-clr)] rounded-full flex items-center justify-center">
                    <IconUser className="h-5 w-5 text-text-clr" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-text-clr font-medium truncate">
                      {user.display_name || user.full_name || "User"}
                    </div>
                    <div className="text-text-clr/70 text-sm truncate">
                      {user.email}
                    </div>
                    <div className="text-text-clr/50 text-xs capitalize">
                      {user.role?.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* User Actions */}
                <div className="pt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200 w-full"
                    onClick={() => setIsUserOpen(false)}
                  >
                    <IconSettings className="h-4 w-4" />
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200 text-left"
                  >
                    <IconLogout className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}