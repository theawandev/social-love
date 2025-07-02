import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, STORAGE_KEYS } from '../constants';

// Import translations
import enCommon from '../locales/en/common.json';
import urCommon from '../locales/ur/common.json';

const resources = {
  [LANGUAGES.EN]: {
    common: enCommon,
  },
  [LANGUAGES.UR]: {
    common: urCommon,
  },
};

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || LANGUAGES.EN;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: LANGUAGES.EN,
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false, // We'll handle loading states manually
    },
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);

  // Update document direction for RTL languages
  if (lng === LANGUAGES.UR) {
    document.dir = 'rtl';
    document.documentElement.lang = 'ur';
  } else {
    document.dir = 'ltr';
    document.documentElement.lang = 'en';
  }
});

// Set initial direction
if (savedLanguage === LANGUAGES.UR) {
  document.dir = 'rtl';
  document.documentElement.lang = 'ur';
} else {
  document.dir = 'ltr';
  document.documentElement.lang = 'en';
}

export default i18n;