import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center gap-1 xs:gap-1.5 sm:gap-2 ${className}`}>
      <label className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 hidden xs:inline" htmlFor="lang-select">Language</label>
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 bg-white border-2 border-emerald-300 rounded-md xs:rounded-lg text-[10px] xs:text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[32px] xs:min-h-[36px] touch-manipulation"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
