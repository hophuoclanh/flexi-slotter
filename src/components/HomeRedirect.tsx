// HomeRedirect.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomeRedirect: React.FC = () => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // If not logged in, redirect to login
    return <Navigate to="/public-booking" replace />;
  }

  // If logged in, redirect based on role:
  return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

export default HomeRedirect;
