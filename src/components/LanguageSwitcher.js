import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200">
        <Globe className="w-5 h-5" />
        <span className="hidden sm:block">{languages.find(lang => lang.code === language)?.flag}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
              language === lang.code
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
