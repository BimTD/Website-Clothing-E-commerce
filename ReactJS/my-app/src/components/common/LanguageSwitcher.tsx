import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'vi' as const, name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  ];

  const handleLanguageChange = (lang: 'vi' | 'en') => {
    setLanguage(lang);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {t('common.language')}:
        </span>
      )}
      
      <div className="relative">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as 'vi' | 'en')}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;

