"use client";

import { useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslation from '@/lib/i18n/locales/en.json';
import esTranslation from '@/lib/i18n/locales/es.json';

// Check if i18n has been initialized
let i18nInitialized = false;

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18next only on the client side and only once
    if (!i18nInitialized) {
      i18nInitialized = true;

      // The translations
      const resources = {
        en: { translation: enTranslation },
        es: { translation: esTranslation }
      };

      i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: 'en',
          interpolation: { escapeValue: false },
          react: { useSuspense: false }
        });
    }
  }, []);

  return <>{children}</>;
}
