import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Mock market data - In production, integrate with AGMARKNET API
// Prices based on AGMARKNET historical data for Jan 2026
const mockMarketData = {
  'धान': [
    { market: 'दिल्ली मंडी', price: 2180, unit: 'क्विंटल', change: +45, date: '24 जन 2026' },
    { market: 'मुंबई मंडी', price: 2220, unit: 'क्विंटल', change: +60, date: '24 जन 2026' },
    { market: 'पुणे मंडी', price: 2195, unit: 'क्विंटल', change: +35, date: '24 जन 2026' },
    { market: 'नागपुर मंडी (महाराष्ट्र)', price: 2190, unit: 'क्विंटल', change: +40, date: '24 जन 2026' },
    { market: 'भंडारा मंडी (महाराष्ट्र)', price: 2170, unit: 'क्विंटल', change: +30, date: '24 जन 2026' },
    { market: 'तुमसर मंडी (महाराष्ट्र)', price: 2160, unit: 'क्विंटल', change: +25, date: '24 जन 2026' }
  ],
  'गेहूं': [
    { market: 'दिल्ली मंडी', price: 2250, unit: 'क्विंटल', change: +85, date: '24 जन 2026' },
    { market: 'मुंबई मंडी', price: 2280, unit: 'क्विंटल', change: +95, date: '24 जन 2026' },
    { market: 'जयपुर मंडी', price: 2240, unit: 'क्विंटल', change: +75, date: '24 जन 2026' },
    { market: 'नागपुर मंडी (महाराष्ट्र)', price: 2260, unit: 'क्विंटल', change: +90, date: '24 जन 2026' },
    { market: 'भंडारा मंडी (महाराष्ट्र)', price: 2235, unit: 'क्विंटल', change: +70, date: '24 जन 2026' },
    { market: 'तुमसर मंडी (महाराष्ट्र)', price: 2220, unit: 'क्विंटल', change: +65, date: '24 जन 2026' }
  ],
  'गन्ना': [
    { market: 'दिल्ली मंडी', price: 3150, unit: 'क्विंटल', change: +120, date: '24 जन 2026' },
    { market: 'लखनऊ मंडी', price: 3280, unit: 'क्विंटल', change: +150, date: '24 जन 2026' },
    { market: 'नागपुर मंडी (महाराष्ट्र)', price: 3350, unit: 'क्विंटल', change: +180, date: '24 जन 2026' },
    { market: 'भंडारा मंडी (महाराष्ट्र)', price: 3280, unit: 'क्विंटल', change: +140, date: '24 जन 2026' },
    { market: 'तुमसर मंडी (महाराष्ट्र)', price: 3200, unit: 'क्विंटल', change: +130, date: '24 जन 2026' }
  ],
  'बैंगन': [
    { market: 'दिल्ली मंडी', price: 22, unit: 'किलो', change: +5, date: '24 जन 2026' },
    { market: 'मुंबई मंडी', price: 25, unit: 'किलो', change: +8, date: '24 जन 2026' },
    { market: 'नागपुर मंडी (महाराष्ट्र)', price: 23, unit: 'किलो', change: +6, date: '24 जन 2026' },
    { market: 'भंडारा मंडी (महाराष्ट्र)', price: 21, unit: 'किलो', change: +4, date: '24 जन 2026' },
    { market: 'तुमसर मंडी (महाराष्ट्र)', price: 19, unit: 'किलो', change: +2, date: '24 जन 2026' }
  ],
  'गोभी': [
    { market: 'दिल्ली मंडी', price: 18, unit: 'किलो', change: +2, date: '24 जन 2026' },
    { market: 'पुणे मंडी', price: 20, unit: 'किलो', change: +3.5, date: '24 जन 2026' },
    { market: 'नागपुर मंडी (महाराष्ट्र)', price: 19, unit: 'किलो', change: +2.5, date: '24 जन 2026' },
    { market: 'भंडारा मंडी (महाराष्ट्र)', price: 17, unit: 'किलो', change: +1.5, date: '24 जन 2026' },
    { market: 'तुमसर मंडी (महाराष्ट्र)', price: 16, unit: 'किलो', change: +1, date: '24 जन 2026' }
  ],
  'मिर्च': [
    { market: 'दिल्ली मंडी', price: 95, unit: 'किलो', change: +8, date: '24 जन 2026' },
    { market: 'मुंबई मंडी', price: 105, unit: 'किलो', change: +12, date: '24 जन 2026' },
    { market: 'नागपुर मंडी (महाराष्ट्र)', price: 98, unit: 'किलो', change: +10, date: '24 जन 2026' },
    { market: 'भंडारा मंडी (महाराष्ट्र)', price: 92, unit: 'किलो', change: +7, date: '24 जन 2026' },
    { market: 'तुमसर मंडी (महाराष्ट्र)', price: 88, unit: 'किलो', change: +5, date: '24 जन 2026' }
  ]
};

const translations = {
  en: {
    title: 'Market Prices',
    subtitle: 'Live Mandi Rates Today',
    selectCrop: 'Select Crop',
    market: 'Market',
    price: 'Price',
    change: 'Change',
    updated: 'Updated',
    noData: 'No market data available',
    searchMarket: 'Search market...',
    trendUp: 'Trending Up',
    trendDown: 'Trending Down',
    stable: 'Stable',
    bestPrice: 'Best Price',
    avgPrice: 'Avg Price Today',
    refresh: 'Refresh Prices',
    msp: 'MSP (Govt.)',
    viewTrend: 'View 7-Day Trend'
  },
  hi: {
    title: 'बाजार भाव',
    subtitle: 'आज की मंडी दरें',
    selectCrop: 'फसल चुनें',
    market: 'मंडी',
    price: 'भाव',
    change: 'बदलाव',
    updated: 'अपडेट',
    noData: 'बाजार जानकारी उपलब्ध नहीं',
    searchMarket: 'मंडी खोजें...',
    trendUp: 'बढ़त में',
    trendDown: 'गिरावट में',
    stable: 'स्थिर',
    bestPrice: 'सबसे अच्छा भाव',
    avgPrice: 'आज का औसत भाव',
    refresh: 'भाव रीफ्रेश करें',
    msp: 'MSP (सरकारी)',
    viewTrend: '7-दिन का रुझान देखें'
  },
  mr: {
    title: 'बाजार भाव',
    subtitle: 'आजचे मंडी दर',
    selectCrop: 'पीक निवडा',
    market: 'मंडी',
    price: 'भाव',
    change: 'बदल',
    updated: 'अपडेट',
    noData: 'बाजार माहिती उपलब्ध नाही',
    searchMarket: 'मंडी शोधा...',
    trendUp: 'वाढ',
    trendDown: 'घट',
    stable: 'स्थिर',
    bestPrice: 'सर्वोत्तम भाव',
    avgPrice: 'आजचा सरासरी भाव',
    refresh: 'भाव रीफ्रेश करा',
    msp: 'MSP (सरकारी)',
    viewTrend: '7-दिवस ट्रेंड पहा'
  }
};

const cropNames = {
  en: { 'धान': 'Rice', 'गेहूं': 'Wheat', 'गन्ना': 'Sugarcane', 'बैंगन': 'Brinjal', 'गोभी': 'Cauliflower', 'मिर्च': 'Chilli' },
  hi: { 'धान': 'धान', 'गेहूं': 'गेहूं', 'गन्ना': 'गन्ना', 'बैंगन': 'बैंगन', 'गोभी': 'गोभी', 'मिर्च': 'मिर्च' },
  mr: { 'धान': 'भात', 'गेहूं': 'गहू', 'गन्ना': 'ऊस', 'बैंगन': 'वांगी', 'गोभी': 'फुलकोबी', 'मिर्च': 'मिरची' }
};

function MarketPrices() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang] || translations.hi;
  const [selectedCrop, setSelectedCrop] = useState('धान');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const marketData = mockMarketData[selectedCrop] || [];
  const filteredData = marketData.filter(m => 
    m.market.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgPrice = marketData.length > 0 
    ? (marketData.reduce((sum, m) => sum + m.price, 0) / marketData.length).toFixed(0)
    : 0;

  const bestPrice = marketData.length > 0
    ? Math.max(...marketData.map(m => m.price))
    : 0;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex flex-col w-full max-w-[100vw] overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 md:py-8">
          {/* Header Section */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 mb-4 xs:mb-6">
            <div>
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2">
                📊 {t.title}
              </h1>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full xs:w-auto px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 bg-white border-2 border-emerald-400 text-emerald-700 rounded-md xs:rounded-lg hover:bg-emerald-50 transition-all font-bold text-[10px] xs:text-xs sm:text-sm shadow-lg min-h-[36px] xs:min-h-[40px]"
            >
              ← Back
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5">
              <div className="text-[10px] xs:text-xs sm:text-sm text-green-700 font-bold mb-1">{t.avgPrice}</div>
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-800">₹{avgPrice}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5">
              <div className="text-[10px] xs:text-xs sm:text-sm text-blue-700 font-bold mb-1">{t.bestPrice}</div>
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-800">₹{bestPrice}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 col-span-2 sm:col-span-1">
              <div className="text-[10px] xs:text-xs sm:text-sm text-amber-700 font-bold mb-1">🌾 {cropNames[lang][selectedCrop]}</div>
              <div className="text-sm xs:text-base sm:text-lg font-bold text-amber-800">{marketData.length} Markets</div>
            </div>
          </div>

          {/* Crop Selection & Search */}
          <div className="bg-white rounded-md xs:rounded-lg shadow-lg p-3 xs:p-4 sm:p-5 mb-4 xs:mb-6 border-2 border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-[10px] xs:text-xs sm:text-sm font-bold text-gray-700 mb-1.5 xs:mb-2">{t.selectCrop}</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 border-2 border-gray-300 rounded-md xs:rounded-lg text-[11px] xs:text-xs sm:text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                >
                  {Object.keys(mockMarketData).map(crop => (
                    <option key={crop} value={crop}>{cropNames[lang][crop]}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] xs:text-xs sm:text-sm font-bold text-gray-700 mb-1.5 xs:mb-2">{t.searchMarket}</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchMarket}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 border-2 border-gray-300 rounded-md xs:rounded-lg text-[11px] xs:text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 xs:px-5 py-2 xs:py-2.5 sm:py-3 bg-emerald-600 text-white rounded-md xs:rounded-lg font-bold text-[10px] xs:text-xs sm:text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 min-h-[40px] flex items-center justify-center gap-2"
                >
                  {loading ? '⏳' : '🔄'} {t.refresh}
                </button>
              </div>
            </div>
          </div>

          {/* Market Prices Table */}
          <div className="bg-white rounded-md xs:rounded-lg sm:rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <tr>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 sm:py-4 text-left text-[10px] xs:text-xs sm:text-sm font-bold text-white">{t.market}</th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 sm:py-4 text-right text-[10px] xs:text-xs sm:text-sm font-bold text-white">{t.price}</th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 sm:py-4 text-center text-[10px] xs:text-xs sm:text-sm font-bold text-white hidden sm:table-cell">{t.change}</th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 sm:py-4 text-right text-[10px] xs:text-xs sm:text-sm font-bold text-white hidden md:table-cell">{t.updated}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-xs xs:text-sm">{t.noData}</td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4">
                          <div className="font-bold text-gray-900 text-[11px] xs:text-xs sm:text-sm md:text-base">{item.market}</div>
                          <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600">{item.unit}</div>
                        </td>
                        <td className="px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 text-right">
                          <div className="font-bold text-emerald-700 text-sm xs:text-base sm:text-lg md:text-xl">₹{item.price}</div>
                          <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">/{item.unit}</div>
                        </td>
                        <td className="px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-[10px] xs:text-xs font-bold ${
                            item.change > 0 ? 'bg-green-100 text-green-700' : 
                            item.change < 0 ? 'bg-red-100 text-red-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.change > 0 ? '📈' : item.change < 0 ? '📉' : '➡️'}
                            {item.change > 0 ? '+' : ''}{item.change}
                          </span>
                        </td>
                        <td className="px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 text-right text-[10px] xs:text-xs text-gray-600 hidden md:table-cell">{item.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-4 xs:mt-6 bg-blue-50 border-2 border-blue-300 rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5">
            <h3 className="text-xs xs:text-sm sm:text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
              💡 {lang === 'en' ? 'Tip' : lang === 'mr' ? 'टीप' : 'सुझाव'}
            </h3>
            <p className="text-[10px] xs:text-xs sm:text-sm text-blue-800">
              {lang === 'en' 
                ? 'Check multiple markets before selling. Best selling time is usually early morning at mandis. Consider transport costs when choosing distant markets.'
                : lang === 'mr'
                ? 'विक्री करण्यापूर्वी अनेक मंड्या तपासा. मंड्यांमध्ये विक्रीचा सर्वोत्तम वेळ सकाळी लवकर असतो. दूरच्या बाजाराची निवड करताना वाहतूक खर्च विचारात घ्या.'
                : 'बेचने से पहले कई मंडियों की तुलना करें। मंडी में बिक्री का सबसे अच्छा समय सुबह जल्दी होता है। दूर की मंडी चुनते समय परिवहन लागत पर विचार करें।'}
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default MarketPrices;
