"use client";

import { useState } from "react";
import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import Link from "next/link";
import AuthProtectedRoute from "../components/AuthProtectedRoute";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    display_name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const message = await signUp(
        formData.email,
        formData.password,
        formData.full_name,
        formData.display_name || undefined,
      );
      setSuccess(
        "Account created successfully! Please check your email for verification.",
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <AuthProtectedRoute>
    
    <div className="my-9 px-3 flex w-full justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto flex flex-col gap-6 bg-primary-clr p-6 rounded-lg shadow-md"
        >
        <h2 className="text-2xl font-bold text-text-clr text-center">
          Sign Up
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
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-100 text-text-clr border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:bg-background-clr/80 transition duration-200"
            placeholder="Enter your email"
            />
        </div>

        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-text-clr mb-1"
          >
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-100 text-text-clr border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:bg-background-clr/80 transition duration-200"
            placeholder="Enter your full name"
            />
        </div>

        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-text-clr mb-1"
          >
            Display Name (Optional)
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            value={formData.display_name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 text-text-clr border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:bg-background-clr/80 transition duration-200"
            placeholder="Enter display name"
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
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-100 text-text-clr border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:bg-background-clr/80 transition duration-200 pr-10"
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
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text-clr mb-1"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-100 text-text-clr border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:bg-background-clr/80 transition duration-200 pr-10"
              placeholder="Confirm your password"
              />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 focus:outline-none hover:text-gray-700 focus:ring-2 focus:ring-gray-700"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
              {showConfirmPassword ? (
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

        {success && (
          <div className="text-green-600 text-sm p-3 rounded-md text-start">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-background-clr text-text-clr font-medium rounded-md shadow-md hover:bg-background-clr/80 focus:outline-none focus:ring-2 focus:ring-text-clr/80 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="text-center text-text-clr text-sm mt-1">
          <Link href="/sign-in" className="text-text-clr hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </form>
    </div>
    </AuthProtectedRoute>
  );
}