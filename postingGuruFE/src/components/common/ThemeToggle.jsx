// src/components/common/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ThemeToggle = ({ variant = 'default' }) => {
  const { theme, setTheme, themes } = useTheme();
  const { t } = useLanguage();

  const getThemeIcon = () => {
    switch (theme) {
      case themes.LIGHT:
        return <Sun className="h-4 w-4" />;
      case themes.DARK:
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (variant === 'simple') {
    return (
      <button
        onClick={() => {
          const nextTheme = theme === themes.LIGHT ? themes.DARK :
            theme === themes.DARK ? themes.SYSTEM : themes.LIGHT;
          setTheme(nextTheme);
        }}
        className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
        title={t('theme.toggle')}
      >
        {getThemeIcon()}
      </button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors">
          {getThemeIcon()}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[8rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
          <DropdownMenu.Item
            className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
            onClick={() => setTheme(themes.LIGHT)}
          >
            <Sun className="h-4 w-4 mr-2" />
            {t('theme.light')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
            onClick={() => setTheme(themes.DARK)}
          >
            <Moon className="h-4 w-4 mr-2" />
            {t('theme.dark')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
            onClick={() => setTheme(themes.SYSTEM)}
          >
            <Monitor className="h-4 w-4 mr-2" />
            {t('theme.system')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ThemeToggle;