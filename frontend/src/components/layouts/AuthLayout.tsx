import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-light-text-primary dark:text-dark-text-primary">
          Attendify
        </h2>
        <p className="mt-2 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Attendance Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-light-surface dark:bg-dark-surface py-8 px-4 shadow-soft dark:shadow-dark-soft sm:rounded-lg sm:px-10 border border-light-border dark:border-dark-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 