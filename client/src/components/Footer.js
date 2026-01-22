import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t, lang } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-100 border-t border-emerald-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 md:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 md:gap-6 text-xs sm:text-sm md:text-base text-gray-400">
          <p className="text-center">
            <span className="text-emerald-400 font-semibold">🌾 {t('appName')}</span> © {currentYear}
          </p>
          <p className="text-center">
            {lang === 'en' ? 'By' : lang === 'hi' ? 'द्वारा' : 'द्वारे'} <span className="text-emerald-400 font-semibold">Pawan Gahane</span> | 
            <a href="mailto:support@kisansathi.com" className="hover:text-emerald-400 transition-colors ml-1.5 text-lg md:text-xl">📧</a> 
            <a href="tel:+919876543210" className="hover:text-emerald-400 transition-colors ml-1.5 text-lg md:text-xl">📞</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
