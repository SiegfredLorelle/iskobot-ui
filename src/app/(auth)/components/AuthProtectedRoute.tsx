"use client";

import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthProtectedRouteProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
};

export default function AuthProtectedRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/",
}: AuthProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // If authenticated, don't render children while redirecting
  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  // User is not authenticated, render the protected content
  return <>{children}</>;
}
