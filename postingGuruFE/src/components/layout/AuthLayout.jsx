// components/layout/AuthLayout.jsx
import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;