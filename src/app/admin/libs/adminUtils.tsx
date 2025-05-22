import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to require authentication for a component
 * Redirects to sign in page if user is not authenticated
 */
export function useRequireAuth(redirectTo: string = "/") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Higher-order component to protect routes
 */
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  redirectTo: string = "/"
) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading } = useRequireAuth(redirectTo);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to sign in...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Check if user has specific permissions (extend as needed)
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    // Implement your permission logic here
    // This is a basic example - you might check user roles, permissions array, etc.
    if (!user) return false;
    
    // Example: Check if user email domain is admin
    const isAdmin = user.email?.endsWith('@admin.com') || false;
    
    switch (permission) {
      case 'admin':
        return isAdmin;
      case 'user':
        return true; // All authenticated users
      default:
        return false;
    }
  };

  const requirePermission = (permission: string): boolean => {
    const hasAccess = hasPermission(permission);
    if (!hasAccess) {
      throw new Error(`Access denied: ${permission} permission required`);
    }
    return hasAccess;
  };

  return {
    hasPermission,
    requirePermission,
    isAdmin: hasPermission('admin'),
    isUser: hasPermission('user'),
  };
}

/**
 * Component to conditionally render content based on permissions
 */
interface ConditionalRenderProps {
  permission?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ConditionalRender({ 
  permission, 
  fallback = null, 
  children 
}: ConditionalRenderProps) {
  const { hasPermission } = usePermissions();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}