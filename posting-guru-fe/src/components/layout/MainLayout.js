import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import { ROUTES } from '../../constants';

const MainLayout = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate anyway
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Top Header */}
      <header className="border-b" style={{
        backgroundColor: 'var(--color-header-bg)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="container flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {t('app.name')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Welcome, {user?.firstName || user?.username || 'User'}!
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {isDark ? '☀️' : '🌙'}
            </Button>

            {/* Logout Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;