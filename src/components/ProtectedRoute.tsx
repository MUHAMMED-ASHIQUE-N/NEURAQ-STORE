// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  user: { email: string; role: string } | null;
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({
  user,
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
