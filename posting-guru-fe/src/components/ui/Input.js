import React from 'react';
import clsx from 'clsx';

const Input = ({
                 label,
                 error,
                 helperText,
                 className,
                 id,
                 ...props
               }) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          className={clsx(
            'input-field transition-all duration-200',
            'focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            {
              'border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900': error,
              'hover:border-gray-300 dark:hover:border-gray-600': !error,
            }
          )}
          style={{
            height: '48px',
            fontSize: '16px', // Prevents zoom on iOS
          }}
          {...props}
        />

        {/* Error Icon */}
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm mt-2 flex items-center gap-1" style={{ color: '#ef4444' }}>
          <span className="font-medium">{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;