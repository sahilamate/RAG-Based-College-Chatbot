import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';

export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Verifying administrator credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
