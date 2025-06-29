// pages/auth/AuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const redirect = searchParams.get('redirect') || '/dashboard';

      if (error) {
        toast.error('Authentication failed');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Set token and redirect
          localStorage.setItem('token', token);
          navigate(redirect, { replace: true });
          toast.success('Successfully logged in!');
        } catch (err) {
          toast.error('Authentication failed');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return <Loading />;
};

export default AuthCallback;