import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";

type ProtectedRouteProps = {
  roles?: UserRole[];
  permissions?: string[];
  redirectTo?: string;
  children?: ReactNode;
};

export default function ProtectedRoute({ roles, permissions, redirectTo = "/", children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">Loading your session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (permissions && !permissions.some((permission) => hasPermission(user.role, permission))) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
