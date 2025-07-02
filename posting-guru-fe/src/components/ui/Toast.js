import React, { createContext, useContext, useState, useEffect } from 'react';
import clsx from 'clsx';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case TOAST_TYPES.ERROR:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case TOAST_TYPES.WARNING:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case TOAST_TYPES.INFO:
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getToastStyles = () => {
    const baseStyles = {
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)',
    };

    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return {
          ...baseStyles,
          borderLeftColor: '#10b981',
          borderLeftWidth: '4px',
        };
      case TOAST_TYPES.ERROR:
        return {
          ...baseStyles,
          borderLeftColor: '#ef4444',
          borderLeftWidth: '4px',
        };
      case TOAST_TYPES.WARNING:
        return {
          ...baseStyles,
          borderLeftColor: '#f59e0b',
          borderLeftWidth: '4px',
        };
      case TOAST_TYPES.INFO:
      default:
        return {
          ...baseStyles,
          borderLeftColor: '#3b82f6',
          borderLeftWidth: '4px',
        };
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return '#10b981';
      case TOAST_TYPES.ERROR:
        return '#ef4444';
      case TOAST_TYPES.WARNING:
        return '#f59e0b';
      case TOAST_TYPES.INFO:
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      className={clsx(
        'max-w-sm w-full rounded-lg shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out',
        {
          'translate-x-0 opacity-100 scale-100': isVisible && !isExiting,
          'translate-x-full opacity-0 scale-95': !isVisible || isExiting,
        }
      )}
      style={getToastStyles()}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div
            className="flex-shrink-0 mr-3 mt-0.5"
            style={{ color: getIconColor() }}
          >
            {getToastIcon()}
          </div>

          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-sm font-semibold mb-1">
                {toast.title}
              </p>
            )}
            <p className="text-sm opacity-90">
              {toast.message}
            </p>
          </div>

          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleRemove}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-6 space-y-4 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, options = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = {
      id,
      message,
      type: options.type || TOAST_TYPES.INFO,
      title: options.title,
      duration: options.duration !== undefined ? options.duration : 5000, // 5 seconds default
      ...options,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const toast = {
    success: (message, options = {}) =>
      addToast(message, { ...options, type: TOAST_TYPES.SUCCESS }),
    error: (message, options = {}) =>
      addToast(message, { ...options, type: TOAST_TYPES.ERROR }),
    warning: (message, options = {}) =>
      addToast(message, { ...options, type: TOAST_TYPES.WARNING }),
    info: (message, options = {}) =>
      addToast(message, { ...options, type: TOAST_TYPES.INFO }),
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export default Toast;