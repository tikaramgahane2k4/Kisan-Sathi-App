import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg sticky top-0 z-50 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-7 lg:px-8 py-3 sm:py-4 md:py-4">
        {/* Top Row - Logo and Buttons */}
        <div className="flex justify-between items-center gap-3 sm-lg:gap-4 md:gap-5 lg:gap-6 w-full">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm-lg:gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 sm-lg:w-14 sm-lg:h-14 md:w-15 md:h-15 lg:w-16 lg:h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
              <span className="text-2xl sm-lg:text-3xl md:text-3xl lg:text-4xl font-bold">🌾</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm-lg:text-xl md:text-2xl lg:text-2xl font-bold text-white truncate">
                {t('appName')}
              </h1>
              {user?.name && (
                <p className="text-xs sm-lg:text-sm md:text-sm lg:text-base text-emerald-100 truncate">
                  {user.name}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons - All sizes */}
          <div className="flex items-center gap-1.5 sm-lg:gap-2 md:gap-3 flex-shrink-0">
            {user && (
              <button
                onClick={() => navigate('/analytics')}
                className="px-2 sm-lg:px-4 md:px-3 md-lg:px-4 lg:px-5 py-2 md-lg:py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 hover:shadow-lg transition-all shadow-md text-xs sm-lg:text-sm md:text-sm md-lg:text-sm lg:text-base flex items-center justify-center gap-0.5 sm-lg:gap-1 md-lg:gap-1.5 active:scale-95 touch-manipulation min-h-[40px] md-lg:min-h-[42px]">
                <span className="text-lg md-lg:text-xl">📊</span>
                <span className="hidden md:inline">{t('analyticsTitle') || 'Analytics'}</span>
              </button>
            )}
            <button
              onClick={logout}
              className="px-2 sm-lg:px-4 md:px-3 md-lg:px-4 lg:px-5 py-2 md-lg:py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 hover:shadow-lg transition-all shadow-md text-xs sm-lg:text-sm md:text-sm md-lg:text-sm lg:text-base active:scale-95 touch-manipulation min-h-[40px] md-lg:min-h-[42px]"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
