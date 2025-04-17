import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

// The translations
const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    // react-specific options
    react: {
      useSuspense: false,
    }
  });

export default i18n;

// Utility function to get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' }
  ];
};

// Custom hook to help with language switching
export const useLanguageToggle = () => {
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLanguage);
    // Store the user's language preference
    localStorage.setItem('i18nextLng', newLanguage);
    return newLanguage;
  };

  const changeLanguage = (langCode: string) => {
    if (langCode && getAvailableLanguages().some(lang => lang.code === langCode)) {
      i18n.changeLanguage(langCode);
      localStorage.setItem('i18nextLng', langCode);
      return langCode;
    }
    return currentLanguage;
  };

  return {
    currentLanguage,
    toggleLanguage,
    changeLanguage,
    availableLanguages: getAvailableLanguages()
  };
};
