import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-white sm:text-gray-600" htmlFor="lang-select">Language</label>
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="px-3 py-2 bg-white border-2 border-emerald-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
