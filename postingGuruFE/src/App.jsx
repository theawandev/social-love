// Updated src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import AuthCallback from '@/pages/auth/AuthCallback';
import Dashboard from '@/pages/dashboard/Dashboard';
import Posts from '@/pages/posts/Posts';
import Scheduled from '@/pages/posts/Scheduled';
import Drafts from '@/pages/posts/Drafts';
import History from '@/pages/posts/History';
import Calendar from '@/pages/posts/Calendar';
import SocialAccounts from '@/pages/accounts/SocialAccounts';
import Profile from '@/pages/profile/Profile';
import Settings from '@/pages/settings/Settings';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Utils
import { queryClient } from '@/lib/queryClient';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <AuthLayout>
                        <Login />
                      </AuthLayout>
                    </PublicRoute>
                  } />
                  <Route path="/signup" element={
                    <PublicRoute>
                      <AuthLayout>
                        <Signup />
                      </AuthLayout>
                    </PublicRoute>
                  } />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/posts" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Posts />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/posts/scheduled" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Scheduled />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/posts/drafts" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Drafts />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/posts/history" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <History />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/posts/calendar" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Calendar />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/accounts" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SocialAccounts />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Settings />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* 404 fallback */}
                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-gray-600 mb-8">Page not found</p>
                        <a href="/" className="text-primary hover:text-primary/80">
                          Go back home
                        </a>
                      </div>
                    </div>
                  } />
                </Routes>

                {/* Global components */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;