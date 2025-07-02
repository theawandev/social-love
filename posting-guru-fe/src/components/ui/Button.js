import React from 'react';
import clsx from 'clsx';

const Button = ({
                  children,
                  variant = 'primary',
                  size = 'md',
                  disabled = false,
                  loading = false,
                  className,
                  onClick,
                  type = 'button',
                  ...props
                }) => {
  const baseClasses = 'btn';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const buttonClasses = clsx(
    variantClasses[variant],
    sizeClasses[size],
    {
      'opacity-50 cursor-not-allowed': disabled || loading,
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
      )}
      {children}
    </button>
  );
};

export default Button;