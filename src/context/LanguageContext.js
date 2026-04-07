import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  const loadTranslations = async (lang) => {
    try {
      const response = await import(`../locales/${lang}.json`);
      setTranslations(response.default);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to Turkish if language file doesn't exist
      if (lang !== 'tr') {
        const fallback = await import('../locales/tr.json');
        setTranslations(fallback.default);
      }
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return value;
  };

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
