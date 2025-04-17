import i18n from 'i18next';

// Utility function to get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' }
  ];
};

// Custom hook to help with language switching
export const toggleLanguage = () => {
  const currentLanguage = i18n.language || 'en';

  const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
  i18n.changeLanguage(newLanguage);

  // Store the user's language preference
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('i18nextLng', newLanguage);
  }

  return newLanguage;
};

export const changeLanguage = (langCode: string) => {
  const currentLanguage = i18n.language || 'en';
  const availableLanguages = getAvailableLanguages();

  if (langCode && availableLanguages.some(lang => lang.code === langCode)) {
    i18n.changeLanguage(langCode);

    // Store the user's language preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('i18nextLng', langCode);
    }

    return langCode;
  }

  return currentLanguage;
};
