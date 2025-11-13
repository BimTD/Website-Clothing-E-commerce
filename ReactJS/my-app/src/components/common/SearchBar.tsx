import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  onSearch,
  onReset
}) => {
  const { t } = useLanguage();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>🔍</span>
          {t('common.search')}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          {t('common.cancel')}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;


