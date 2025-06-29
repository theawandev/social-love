// src/contexts/LanguageContext.jsx
import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'; // Initialize i18n

const LanguageContext = createContext();

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
];

export function LanguageProvider({ children }) {
  const { i18n, t } = useTranslation();

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);

      // Handle RTL languages
      const language = LANGUAGES.find(lang => lang.code === languageCode);
      const direction = language?.rtl ? 'rtl' : 'ltr';

      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', languageCode);

      // Store preference
      localStorage.setItem('social-scheduler-language', languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getLanguageByCode = (code) => {
    return LANGUAGES.find(lang => lang.code === code);
  };

  const value = {
    currentLanguage,
    languages: LANGUAGES,
    changeLanguage,
    getLanguageByCode,
    t, // Translation function
    isRTL: currentLanguage?.rtl || false,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;