// src/components/layout/Header.jsx
import React from 'react';
import { Menu, Bell, Search, Globe, Moon, Sun, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/utils/cn';

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme, themes, setTheme } = useTheme();
  const { currentLanguage, languages, changeLanguage, t } = useLanguage();
  const { logout, user } = useAuth();

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

  return (
    <Tooltip.Provider>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-muted-foreground lg:hidden hover:text-foreground"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form className="relative flex flex-1 max-w-md" action="#" method="GET">
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
            <input
              id="search-field"
              className="block h-full w-full border-0 py-0 pl-10 pr-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
              placeholder={t('common.search')}
              type="search"
              name="search"
            />
          </form>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme Selector */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors">
                    {getThemeIcon()}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm shadow-md">
                    {t('theme.toggle')}
                    <Tooltip.Arrow className="fill-popover" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
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

          {/* Language Selector */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="flex items-center gap-1 h-8 px-2 rounded-md hover:bg-accent transition-colors">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">{currentLanguage.flag}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm shadow-md">
                    {t('language.change')}
                    <Tooltip.Arrow className="fill-popover" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[10rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
                {languages.map((language) => (
                  <DropdownMenu.Item
                    key={language.code}
                    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                    onClick={() => changeLanguage(language.code)}
                  >
                    <span className="mr-2">{language.flag}</span>
                    <span className="flex-1">{language.nativeName}</span>
                    {currentLanguage.code === language.code && (
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Notifications */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button className="relative flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors">
                <Bell className="h-4 w-4" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                  2
                </span>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm shadow-md">
                {t('notifications.title')}
                <Tooltip.Arrow className="fill-popover" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* User menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-md p-1 hover:bg-accent transition-colors">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.first_name || user?.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.subscription_tier || 'Free'}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[12rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
                <div className="px-2 py-1.5 border-b mb-1">
                  <p className="text-sm font-medium">{user?.first_name || user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>

                <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                  <a href="/profile" className="flex items-center w-full">
                    {t('navigation.profile')}
                  </a>
                </DropdownMenu.Item>

                <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                  <a href="/settings" className="flex items-center w-full">
                    {t('navigation.settings')}
                  </a>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-border my-1" />

                <DropdownMenu.Item
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm text-destructive"
                  onClick={logout}
                >
                  {t('auth.logout')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
    </Tooltip.Provider>
  );
};

export default Header;