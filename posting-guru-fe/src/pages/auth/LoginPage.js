import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ROUTES } from '../../constants';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data);

      // Show success toast
      toast.success('Login successful!', {
        title: 'Welcome back',
        duration: 3000,
      });

      // Navigate to dashboard on successful login
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      // Show error toast
      toast.error(err.message || 'Login failed', {
        title: 'Login Error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Show info toast for demo
    toast.info('Google OAuth integration will be implemented with your backend', {
      title: 'Coming Soon',
      duration: 4000,
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          {t('auth.welcomeBack', 'Welcome back')}
        </h2>
        <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {t('auth.signInToAccount', 'Sign in to your account to continue')}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label={t('auth.email')}
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          label={t('auth.password')}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-2 mr-3"
              style={{ accentColor: '#3b82f6' }}
              {...register('rememberMe')}
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t('auth.rememberMe', 'Remember me')}
            </span>
          </label>

          <Link
            to="#"
            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full h-12 text-base font-semibold"
        >
          {loading ? t('common.loading') : t('auth.signIn')}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
        <span className="px-4 text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          {t('auth.orContinueWith', 'Or continue with')}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
      </div>

      {/* Google Login */}
      <Button
        variant="secondary"
        onClick={handleGoogleLogin}
        className="w-full h-12 flex items-center justify-center gap-3 text-base font-medium hover:shadow-md transition-all"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {t('auth.signInWithGoogle')}
      </Button>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {t('auth.dontHaveAccount')}{' '}
          <Link
            to={ROUTES.REGISTER}
            className="font-semibold text-blue-500 hover:text-blue-600 transition-colors"
          >
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;