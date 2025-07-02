import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import { LANGUAGES } from '../../constants';

const AuthLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Modern gradient background */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center relative overflow-hidden"
           style={{
             background: isDark
               ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
               : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)'
           }}>

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full"
               style={{
                 background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                 animation: 'float 6s ease-in-out infinite'
               }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full"
               style={{
                 background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                 animation: 'float 8s ease-in-out infinite reverse'
               }}></div>
        </div>

        <div className="relative z-10 text-center max-w-lg px-8 text-white">
          <div className="mb-8">
            <div className="text-7xl mb-6 animate-bounce">🚀</div>
            <h1 className="text-4xl font-bold mb-6">
              {t('app.name')}
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              {t('auth.heroText', 'Automate your social media presence across all platforms with AI-powered content creation')}
            </p>
          </div>

          {/* Feature highlights with icons */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center text-2xl">
                🔗
              </div>
              <div>
                <h3 className="font-semibold text-lg">Multi-Platform</h3>
                <p className="opacity-80">Connect all your social accounts</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered</h3>
                <p className="opacity-80">Generate content with AI assistance</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center text-2xl">
                ⏰
              </div>
              <div>
                <h3 className="font-semibold text-lg">Smart Scheduling</h3>
                <p className="opacity-80">Post at optimal times automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8"
           style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="w-full max-w-md">

          {/* Mobile header (only show on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-4">🚀</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {t('app.name')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t('app.tagline')}
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="card p-8 shadow-xl" style={{
            backgroundColor: 'var(--color-card-bg)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }}>
            {children}
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-sm flex items-center gap-2"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Button>

            <div className="h-4 w-px" style={{ backgroundColor: 'var(--color-border)' }}></div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeLanguage(LANGUAGES.EN)}
                className={`text-sm ${i18n.language === LANGUAGES.EN ? 'font-bold text-blue-500' : ''}`}
              >
                English
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeLanguage(LANGUAGES.UR)}
                className={`text-sm ${i18n.language === LANGUAGES.UR ? 'font-bold text-blue-500' : ''}`}
              >
                اردو
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;