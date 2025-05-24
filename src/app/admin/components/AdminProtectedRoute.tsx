"use client";

import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RoleProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
};

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  fallback = <div>Loading...</div>,
  redirectTo = "/",
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (!hasRequiredRole) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, hasRequiredRole, router, redirectTo]);

  if (isLoading || !user) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated || !hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
