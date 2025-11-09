"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "employee";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        setIsRedirecting(true);
        router.push("/");
      } else if (requiredRole && user.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        setIsRedirecting(true);
        const targetPath =
          user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
        router.push(targetPath);
      }
    }
  }, [user, isLoading, requiredRole, router]);

  // Show loading state while checking authentication or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {isRedirecting ? "Redirecting..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated or has wrong role
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
