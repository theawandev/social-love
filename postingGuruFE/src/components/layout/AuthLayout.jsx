// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/common/LanguageSelector';
import ThemeToggle from '@/components/common/ThemeToggle';

const AuthLayout = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">SM</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Social Scheduler
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              <LanguageSelector variant="compact" />
              <ThemeToggle variant="simple" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6">
                Manage All Your Social Media in One Place
              </h1>
              <p className="text-lg text-primary-foreground/90 mb-8">
                Schedule posts, generate content with AI, and grow your audience across Facebook, Instagram, LinkedIn, TikTok, and YouTube.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-white rounded-full" />
                  <span>AI-powered content generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-white rounded-full" />
                  <span>Smart scheduling optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-white rounded-full" />
                  <span>Multi-platform posting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-white rounded-full" />
                  <span>Analytics and insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 h-20 w-20 bg-white/10 rounded-full" />
          <div className="absolute bottom-20 left-10 h-16 w-16 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-20 h-12 w-12 bg-white/5 rounded-full" />
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
            <div className="mt-2 sm:mt-0">
              © 2024 Social Scheduler. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;