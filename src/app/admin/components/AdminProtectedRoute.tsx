"use client";

import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function AdminProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = "/" 
}: AdminProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // If not authenticated, don't render children while redirecting
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}