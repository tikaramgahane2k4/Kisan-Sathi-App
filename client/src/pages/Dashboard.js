import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCrops, createCrop } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WeatherWidget from '../components/WeatherWidget';

const cropNameMap = {
  'धान': { en: 'Rice', hi: 'धान', mr: 'भात' },
  'गेहूं': { en: 'Wheat', hi: 'गेहूं', mr: 'गहू' },
  'गन्ना': { en: 'Sugarcane', hi: 'गन्ना', mr: 'ऊस' },
  'बैंगन': { en: 'Brinjal', hi: 'बैंगन', mr: 'वांगी' },
  'गोभी': { en: 'Cauliflower', hi: 'गोभी', mr: 'फुलकोबी' },
  'मिर्च': { en: 'Chilli', hi: 'मिर्च', mr: 'मिरची' }
};

const statusMap = {
  'चालू': { en: 'Ongoing', hi: 'चालू', mr: 'चालू' },
  'पूर्ण': { en: 'Completed', hi: 'पूर्ण', mr: 'पूर्ण' }
};

const unitMap = {
  'बीघा': { en: 'Bigha', hi: 'बीघा', mr: 'बिघा' },
  'डिस्मिल': { en: 'Dismil', hi: 'डिस्मिल', mr: 'डिस्मिल' },
  'एकड़': { en: 'Acre', hi: 'एकड़', mr: 'एकर' },
  'हेक्टेयर': { en: 'Hectare', hi: 'हेक्टेयर', mr: 'हेक्टर' }
};

const translateValue = (map, value, lang) => map[value]?.[lang] || value;
const localeForLang = (lang) => (lang === 'en' ? 'en-IN' : lang === 'mr' ? 'mr-IN' : 'hi-IN');

function Dashboard() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const dateLocale = localeForLang(lang);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCrop, setNewCrop] = useState({
    cropType: 'धान',
    startDate: new Date().toISOString().split('T')[0],
    expectedDuration: '',
    landSize: { value: '', unit: 'बीघा' }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const { data } = await getCrops();
      setCrops(data.crops);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    setError('');

    const valueNum = parseFloat(newCrop.landSize.value);
    const durationNum = Number(newCrop.expectedDuration);

    if (!valueNum || valueNum <= 0) {
      setError(t('areaValidation'));
      return;
    }
    if (!durationNum || durationNum <= 0) {
      setError(t('durationValidation'));
      return;
    }

    try {
      const payload = {
        ...newCrop,
        expectedDuration: durationNum,
        landSize: {
          value: valueNum,
          unit: newCrop.landSize.unit
        }
      };
      await createCrop(payload);
      setShowModal(false);
      setNewCrop({
        cropType: 'धान',
        startDate: new Date().toISOString().split('T')[0],
        expectedDuration: '',
        landSize: { value: '', unit: 'बीघा' }
      });
      fetchCrops();
    } catch (err) {
      setError(err.response?.data?.message || t('createCropError'));
    }
  };

  const activeCrops = crops.filter(c => c.status === 'चालू');
  const completedCrops = crops.filter(c => c.status === 'पूर्ण');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-6 md:py-7 lg:py-8">
          {/* Weather Advisory */}
          <WeatherWidget />
          {/* Add Crop Button */}
          <div className="mb-6 sm:mb-8 md:mb-9 flex justify-center sm:justify-start w-full">
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-6 sm:px-8 md:px-9 lg:px-10 py-3 sm:py-4 md:py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-base sm:text-lg md:text-lg min-h-[48px] touch-manipulation"
            >
              <span className="text-xl sm:text-2xl md:text-2xl">+</span>
              {t('startNewCrop')}
            </button>
          </div>

          {loading ? (
            <LoadingSpinner fullScreen />
          ) : (
            <>
              {/* Active Crops */}
              <section className="mb-8 sm:mb-10 md:mb-10 lg:mb-12">
                <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                    {t('activeCrops')}
                  </h2>
                  <div className="h-1 w-10 sm:w-12 md:w-12 bg-gradient-to-r from-primary to-secondary rounded"></div>
                  <p className="text-xs sm:text-sm md:text-sm text-gray-500 mt-2">
                    {activeCrops.length} {activeCrops.length === 1 ? 'crop' : 'crops'} ongoing
                  </p>
                </div>
                {activeCrops.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 md:p-8 text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-3">🌾</div>
                    <p className="text-sm sm:text-base md:text-base text-gray-600">{t('noActiveCrops')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-6 w-full">
                    {activeCrops.map(crop => (
                      <CropCard key={crop._id} crop={crop} onClick={() => navigate(`/crop/${crop._id}`)} lang={lang} dateLocale={dateLocale} />
                    ))}
                  </div>
                )}
              </section>

              {/* Completed Crops */}
              {completedCrops.length > 0 && (
                <section className="mb-8 sm:mb-10 lg:mb-12">
                  <div className="mb-4 sm:mb-5 lg:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                      {t('completedCrops')}
                    </h2>
                    <div className="h-1 w-10 sm:w-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded"></div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      {completedCrops.length} {completedCrops.length === 1 ? 'crop' : 'crops'} completed
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
                    {completedCrops.map(crop => (
                      <CropCard key={crop._id} crop={crop} onClick={() => navigate(`/crop/${crop._id}`)} lang={lang} dateLocale={dateLocale} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Crop Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md md:max-w-lg p-5 sm:p-6 md:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto modal-card">
            <h3 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-5">{t('modalTitle')}</h3>
            
            {error && (
              <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm md:text-base">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCrop} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2 md:mb-2 text-sm md:text-base">{t('selectCrop')}</label>
                <select
                  value={newCrop.cropType}
                  onChange={(e) => setNewCrop({...newCrop, cropType: e.target.value})}
                  className="w-full px-3 sm:px-4 md:px-4 py-2.5 sm:py-3 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                >
                  {Object.keys(cropNameMap).map((value) => (
                    <option key={value} value={value}>{translateValue(cropNameMap, value, lang)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('startDate')}</label>
                <input
                  type="date"
                  value={newCrop.startDate}
                  onChange={(e) => setNewCrop({...newCrop, startDate: e.target.value})}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('expectedDuration')}</label>
                <input
                  type="number"
                  value={newCrop.expectedDuration}
                  onChange={(e) => setNewCrop({...newCrop, expectedDuration: e.target.value})}
                  placeholder={t('durationPlaceholder')}
                  min="1"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('landArea')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={newCrop.landSize.value}
                    onChange={(e) => setNewCrop({
                      ...newCrop,
                      landSize: { ...newCrop.landSize, value: e.target.value }
                    })}
                    placeholder={t('landPlaceholder')}
                    min="0.01"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <select
                    value={newCrop.landSize.unit}
                    onChange={(e) => setNewCrop({
                      ...newCrop,
                      landSize: { ...newCrop.landSize, unit: e.target.value }
                    })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {Object.keys(unitMap).map((value) => (
                      <option key={value} value={value}>{translateValue(unitMap, value, lang)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-5 py-3 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-base md:text-base font-bold transition-all min-h-[48px] touch-manipulation"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 md:py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg text-base md:text-base font-bold transition-all active:scale-95 min-h-[48px] touch-manipulation"
                >
                  {t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

const CropCard = ({ crop, onClick, lang, dateLocale }) => {
  const { t } = useLanguage();
  const statusLabel = translateValue(statusMap, crop.status, lang);
  const cropLabel = translateValue(cropNameMap, crop.cropType, lang);
  const unitLabel = translateValue(unitMap, crop.landSize?.unit, lang);

  return (
    <div
      onClick={onClick}
      className="flex flex-col h-full bg-gradient-to-br from-white to-emerald-50 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer p-4 sm:p-5 lg:p-6 active:scale-95 group border-2 border-emerald-200 hover:border-emerald-400"
    >
      {/* Header - Crop Name & Status */}
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex-1 leading-tight line-clamp-2">
          {cropLabel}
        </h3>
        <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap flex-shrink-0 ${
          crop.status === 'चालू' ? 'bg-emerald-200 text-emerald-800 border-2 border-emerald-400' : 'bg-blue-200 text-blue-800 border-2 border-blue-400'
        }`}>
          {statusLabel}
        </span>
      </div>
      
      {/* Crop Details - Flexbox Column */}
      <div className="flex flex-col gap-2 sm:gap-2.5 text-sm sm:text-base text-gray-700 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b-2 border-emerald-200 flex-grow">
        <div className="flex items-center gap-2">
          <span className="text-lg flex-shrink-0">📅</span>
          <span className="truncate font-medium">{new Date(crop.startDate).toLocaleDateString(dateLocale)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg flex-shrink-0">🌾</span>
          <span className="truncate font-medium">
            {crop?.landSize?.value && crop?.landSize?.unit
              ? `${crop.landSize.value} ${unitLabel}`
              : t('notAvailable')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg flex-shrink-0">💰</span>
          <span className="font-bold text-emerald-700 truncate">₹{crop.totalCost?.toFixed(2) || '0.00'}</span>
        </div>
        {crop.status === 'पूर्ण' && crop.netProfit !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0">{crop.netProfit >= 0 ? '📈' : '📉'}</span>
            <span className={`font-bold truncate text-base ${crop.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{Math.abs(crop.netProfit).toFixed(2)}
            </span>
          </div>
        )}
      </div>
      
      {/* View Button - Always at bottom */}
      <button className="w-full py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base sm:text-lg font-bold rounded-lg hover:shadow-lg transition-all active:scale-95 min-h-[48px] touch-manipulation mt-auto">
        {t('viewDetails')}
      </button>
    </div>
  );
};

export default Dashboard;
