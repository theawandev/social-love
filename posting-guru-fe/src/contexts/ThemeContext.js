import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, STORAGE_KEYS } from '../constants';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or default to system
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    return savedTheme || THEMES.SYSTEM;
  });

  const [isDark, setIsDark] = useState(false);

  // Function to get system theme preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  };

  // Function to apply theme to document
  const applyTheme = (newTheme) => {
    const root = document.documentElement;

    if (newTheme === THEMES.DARK ||
      (newTheme === THEMES.SYSTEM && getSystemTheme() === THEMES.DARK)) {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
  };

  // Function to change theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    applyTheme(newTheme);
  };

  // Function to toggle theme (for quick dark/light toggle)
  const toggleTheme = () => {
    const newTheme = isDark ? THEMES.LIGHT : THEMES.DARK;
    changeTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);

    // Listen for system theme changes if theme is set to system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const value = {
    theme,
    isDark,
    changeTheme,
    toggleTheme,
    themes: {
      LIGHT: THEMES.LIGHT,
      DARK: THEMES.DARK,
      SYSTEM: THEMES.SYSTEM,
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};