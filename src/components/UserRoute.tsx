// src/components/UserRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Not logged in: redirect to login.
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    // Admin should not access user-only pages.
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default UserRoute;
