// src/components/common/LanguageSelector.jsx
import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = ({ variant = 'default' }) => {
  const { currentLanguage, languages, changeLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-colors">
            <span className="text-sm">{currentLanguage.flag}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[8rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
            {languages.map((language) => (
              <DropdownMenu.Item
                key={language.code}
                className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                onClick={() => changeLanguage(language.code)}
              >
                <span className="mr-2">{language.flag}</span>
                <span>{language.nativeName}</span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors">
          <Globe className="h-4 w-4" />
          <span className="text-sm">{currentLanguage.flag}</span>
          <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[12rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
          {languages.map((language) => (
            <DropdownMenu.Item
              key={language.code}
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded-sm"
              onClick={() => changeLanguage(language.code)}
            >
              <span className="mr-3">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">{language.name}</span>
              </div>
              {currentLanguage.code === language.code && (
                <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default LanguageSelector;