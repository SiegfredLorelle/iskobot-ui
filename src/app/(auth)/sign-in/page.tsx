"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import Link from "next/link";
import AuthProtectedRoute from "../components/AuthProtectedRoute";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/admin");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthProtectedRoute>
      <div className="my-9 px-3 flex w-full justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md mx-auto flex flex-col gap-6 bg-primary-clr p-6 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold text-text-clr text-center">
            Sign In
          </h2>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-clr mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-100 text-form-clr border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:bg-background-clr/80 transition duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-clr mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-100 text-form-clr border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:bg-background-clr/80 transition duration-200 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 focus:outline-none hover:text-gray-700 focus:ring-2 focus:ring-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <IconEyeOff className="h-5 w-5" />
                ) : (
                  <IconEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 rounded-md text-start">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-background-clr text-form-clr font-medium rounded-md shadow-md hover:bg-background-clr/80 focus:outline-none focus:ring-2 focus:ring-text-clr/80 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center text-text-clr text-sm mt-1">
            <Link href="/sign-up" className="text-text-clr hover:underline">
              Don&apos;t have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </AuthProtectedRoute>
  );
}
