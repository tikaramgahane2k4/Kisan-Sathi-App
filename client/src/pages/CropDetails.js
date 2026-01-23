import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCrop, completeCrop, deleteCrop, deleteMaterial } from '../utils/api';
import { generateCropPDF } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

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

const landUnitMap = {
  'बीघा': { en: 'Bigha', hi: 'बीघा', mr: 'बिघा' },
  'डिस्मिल': { en: 'Dismil', hi: 'डिस्मिल', mr: 'डिस्मिल' },
  'एकड़': { en: 'Acre', hi: 'एकड़', mr: 'एकर' },
  'हेक्टेयर': { en: 'Hectare', hi: 'हेक्टेयर', mr: 'हेक्टर' }
};

const productionUnitMap = {
  'क्विंटल': { en: 'Quintal', hi: 'क्विंटल', mr: 'क्विंटल' },
  'टन': { en: 'Ton', hi: 'टन', mr: 'टन' },
  'किलोग्राम': { en: 'Kilogram', hi: 'किलोग्राम', mr: 'किलोग्राम' }
};

const materialTypeMap = {
  'बीज': { en: 'Seed', hi: 'बीज', mr: 'बियाणे' },
  'खाद': { en: 'Fertilizer', hi: 'खाद', mr: 'खत' },
  'दवाई': { en: 'Medicine', hi: 'दवाई', mr: 'औषध' },
  'कीटनाशक': { en: 'Pesticide', hi: 'कीटनाशक', mr: 'किटकनाशक' },
  'मजदूरी': { en: 'Labor', hi: 'मजदूरी', mr: 'मजुरी' },
  'ट्रैक्टर/उपकरण': { en: 'Tractor/Equipment', hi: 'ट्रैक्टर/उपकरण', mr: 'ट्रॅक्टर/साधने' },
  'पानी/बिजली': { en: 'Water/Electricity', hi: 'पानी/बिजली', mr: 'पाणी/वीज' },
  'परिवहन': { en: 'Transport', hi: 'परिवहन', mr: 'वाहतूक' },
  'भंडारण': { en: 'Storage', hi: 'भंडारण', mr: 'साठवण' },
  'अन्य': { en: 'Other', hi: 'अन्य', mr: 'इतर' }
};

const quantityUnitMap = {
  'किलोग्राम': { en: 'Kilogram', hi: 'किलोग्राम', mr: 'किलोग्राम' },
  'लीटर': { en: 'Litre', hi: 'लीटर', mr: 'लिटर' },
  'पैकेट': { en: 'Packet', hi: 'पैकेट', mr: 'पॅकेट' },
  'बोरी': { en: 'Bag', hi: 'बोरी', mr: 'गोणी' },
  'दिन': { en: 'Day', hi: 'दिन', mr: 'दिवस' },
  'घंटा': { en: 'Hour', hi: 'घंटा', mr: 'तास' },
  'पीस': { en: 'Piece', hi: 'पीस', mr: 'तुकडा' },
  'बोतल': { en: 'Bottle', hi: 'बोतल', mr: 'बाटली' },
  'व्यक्ति': { en: 'Person', hi: 'व्यक्ति', mr: 'व्यक्ती' }
};

const genderMap = {
  'महिला': { en: 'Female', hi: 'महिला', mr: 'महिला' },
  'पुरुष': { en: 'Male', hi: 'पुरुष', mr: 'पुरुष' },
  'mixed': { en: 'Mixed (Both)', hi: 'मिश्रित (दोनों)', mr: 'मिश्रित (दोन्ही)' }
};

const translateValue = (map, value, lang) => map[value]?.[lang] || value;
const localeForLang = (lang) => (lang === 'en' ? 'en-IN' : lang === 'mr' ? 'mr-IN' : 'hi-IN');

function CropDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const dateLocale = localeForLang(lang);
  const [crop, setCrop] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [production, setProduction] = useState({
    quantity: '',
    unit: 'क्विंटल',
    sellingPrice: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await getCrop(id);
      setCrop(data.crop);
      setMaterials(data.materials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCrop = async (e) => {
    e.preventDefault();
    try {
      await completeCrop(id, production);
      setShowCompleteModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('genericError'));
    }
  };

  const handleDeleteCrop = async () => {
    if (window.confirm(t('deleteCropConfirm'))) {
      try {
        await deleteCrop(id);
        navigate('/dashboard');
      } catch (err) {
        alert(err.response?.data?.message || t('genericError'));
      }
    }
  };

  const handleGeneratePDF = () => {
    if (crop?.status !== 'पूर्ण') {
      alert(t('pdfRequiresCompletion'));
      return;
    }
    generateCropPDF(crop, materials);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('notFound')}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-primary text-white rounded-lg"
          >
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const totalCost = materials.reduce((sum, m) => sum + m.price, 0);
  const cropLabel = translateValue(cropNameMap, crop.cropType, lang);
  const statusLabel = translateValue(statusMap, crop.status, lang);
  const landUnitLabel = translateValue(landUnitMap, crop.landSize?.unit, lang);

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow w-full max-w-[100vw]">
        <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:underline mb-1.5 xs:mb-2 flex items-center gap-1 text-[10px] xs:text-xs sm:text-sm touch-manipulation"
          >
            ← {t('backToDashboard')}
          </button>
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3">
            <h1 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{cropLabel} - {t('cropInfo')}</h1>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 sm:py-5 md:py-6 lg:py-8 overflow-x-hidden">
        {/* Responsive Flex/Grid Layout - Stacks on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row xl:flex-row gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 w-full max-w-full">
          {/* Left Column - Crop Info & Actions - Full width on mobile, 1/3 on desktop */}
          <div className="w-full lg:w-1/3 xl:w-1/3 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 max-w-full">
            {/* Crop Info Box */}
            <div className="bg-white rounded-md xs:rounded-lg shadow-sm border border-gray-100 p-2.5 xs:p-3 sm:p-4 md:p-5">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 xs:mb-2 sm:mb-3">{t('cropInfo')}</h2>
              <div className="space-y-1 xs:space-y-1.5 sm:space-y-2 text-[11px] xs:text-xs sm:text-sm md:text-base text-gray-700">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-gray-600">{t('crop')}:</span>
                  <span className="font-semibold text-right">{cropLabel}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-gray-600">{t('startLabel')}:</span>
                  <span className="text-right">{new Date(crop.startDate).toLocaleDateString(dateLocale)}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-gray-600">{t('land')}:</span>
                  <span className="text-right">{crop?.landSize?.value && crop?.landSize?.unit ? `${crop.landSize.value} ${landUnitLabel}` : t('notAvailable')}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-gray-600">{t('duration')}:</span>
                  <span className="text-right">{crop.expectedDuration} {t('months')}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-gray-600">{t('status')}:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    crop.status === 'चालू' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{t('financialSummary')}</h2>
              <div className="space-y-1.5 xs:space-y-2 sm:space-y-2.5 text-[11px] xs:text-xs sm:text-sm md:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('totalCost')}:</span>
                  <span className="font-bold text-gray-900">₹{totalCost.toFixed(2)}</span>
                </div>
                {crop.status === 'पूर्ण' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('totalIncome')}:</span>
                      <span className="font-bold text-gray-900">₹{crop.totalIncome?.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-1.5 xs:pt-2 flex justify-between items-center">
                      <span className="text-gray-900 font-bold">{crop.netProfit >= 0 ? t('netProfit') : t('netLoss')}:</span>
                      <span className={`font-bold text-sm xs:text-base sm:text-lg ${crop.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{Math.abs(crop.netProfit).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons - Fully Responsive: 2 cols mobile, 1 col stacked desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 xs:gap-2.5 sm:gap-3 lg:gap-3 w-full">
              {crop.status === 'चालू' && (
                <>
                  <button
                    onClick={() => navigate(`/crop/${id}/add-material`)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 lg:gap-2.5 w-full py-2.5 xs:py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md xs:rounded-lg font-bold text-[10px] xs:text-xs sm:text-sm lg:text-base hover:shadow-xl transition-all active:scale-95 min-h-[44px] xs:min-h-[48px] lg:min-h-[52px] touch-manipulation"
                  >
                    <span className="text-base xs:text-lg sm:text-xl lg:text-2xl">+</span>
                    <span className="text-center leading-tight">{t('addExpense')}</span>
                  </button>
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 lg:gap-2.5 w-full py-2.5 xs:py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md xs:rounded-lg font-bold text-[10px] xs:text-xs sm:text-sm lg:text-base hover:shadow-xl transition-all active:scale-95 min-h-[44px] xs:min-h-[48px] lg:min-h-[52px] touch-manipulation"
                  >
                    <span className="text-base xs:text-lg sm:text-xl lg:text-2xl">✓</span>
                    <span className="text-center leading-tight">{t('completeCrop')}</span>
                  </button>
                </>
              )}
              <button
                onClick={handleGeneratePDF}
                disabled={crop.status !== 'पूर्ण'}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 lg:gap-2.5 w-full py-2.5 xs:py-3 sm:py-3.5 lg:py-4 rounded-md xs:rounded-lg font-bold text-[10px] xs:text-xs sm:text-sm lg:text-base transition-all min-h-[44px] xs:min-h-[48px] lg:min-h-[52px] touch-manipulation ${
                  crop.status === 'पूर्ण'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-xl active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={crop.status === 'पूर्ण' ? '' : t('pdfRequiresCompletion')}
              >
                <span className="text-base xs:text-lg sm:text-xl lg:text-2xl">📄</span>
                <span className="text-center leading-tight">{t('generatePDF')}</span>
              </button>
              <button
                onClick={handleDeleteCrop}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 lg:gap-2.5 w-full py-2.5 xs:py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-md xs:rounded-lg font-bold text-[10px] xs:text-xs sm:text-sm lg:text-base hover:shadow-xl transition-all active:scale-95 min-h-[44px] xs:min-h-[48px] lg:min-h-[52px] touch-manipulation"
              >
                <span className="text-base xs:text-lg sm:text-xl lg:text-2xl">🗑️</span>
                <span className="text-center leading-tight">{t('deleteCrop')}</span>
              </button>
            </div>
            {crop.status !== 'पूर्ण' && (
              <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 xs:mt-4">{t('downloadPdfAfterComplete')}</p>
            )}
          </div>

          {/* Right Column - Materials List - Full width on mobile, 2/3 on desktop */}
          <div className="w-full lg:w-2/3 xl:w-2/3">
            <div className="bg-white rounded-md xs:rounded-lg shadow-sm border border-gray-100 p-2.5 xs:p-3 sm:p-4 md:p-5">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">
                {t('expenseDetails')} ({materials.length})
              </h2>
              
              {materials.length === 0 ? (
                <div className="text-center py-6 xs:py-8 sm:py-10 md:py-12 text-gray-500">
                  <p className="mb-3 xs:mb-4 text-[11px] xs:text-xs sm:text-sm md:text-base">{t('noExpensesYet')}</p>
                  {crop.status === 'चालू' && (
                    <button
                      onClick={() => navigate(`/crop/${id}/add-material`)}
                      className="px-3 xs:px-4 sm:px-5 md:px-6 py-1.5 xs:py-2 bg-primary text-white rounded-md xs:rounded-lg text-[11px] xs:text-xs sm:text-sm md:text-base"
                    >
                      {t('addFirstExpense')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Category Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md xs:rounded-lg p-2.5 xs:p-3 sm:p-4">
                    <h3 className="font-bold text-gray-900 mb-1.5 xs:mb-2 sm:mb-3 text-[11px] xs:text-xs sm:text-sm md:text-base">{t('byType')}</h3>
                    <div className="grid grid-cols-1 gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
                      {(() => {
                        const groupedByType = materials.reduce((acc, mat) => {
                          if (!acc[mat.materialType]) {
                            acc[mat.materialType] = [];
                          }
                          acc[mat.materialType].push(mat);
                          return acc;
                        }, {});
                        
                        return Object.entries(groupedByType).map(([type, items]) => {
                          const total = items.reduce((sum, item) => sum + item.price, 0);
                          const unitRate = items.length > 0 ? (items[0].price / items[0].quantity.value).toFixed(2) : 0;
                          const totalQty = items.reduce((sum, item) => sum + item.quantity.value, 0);
                          const unit = items.length > 0 ? items[0].quantity.unit : '';
                          const typeLabel = translateValue(materialTypeMap, type, lang);
                          const unitLabel = translateValue(quantityUnitMap, unit, lang);
                          
                          return (
                            <div key={type} className="bg-white p-2 xs:p-2.5 sm:p-3 rounded border border-blue-100">
                              <div className="flex justify-between items-center mb-0.5 xs:mb-1">
                                <span className="font-semibold text-gray-900 text-[11px] xs:text-xs sm:text-sm md:text-base">{typeLabel}</span>
                                <span className="font-bold text-primary text-xs xs:text-sm sm:text-base md:text-lg">₹{total.toFixed(2)}</span>
                              </div>
                              <div className="text-[10px] xs:text-[11px] sm:text-xs text-gray-600">
                                {totalQty} {unitLabel} × ₹{unitRate}/{unitLabel} = ₹{total.toFixed(2)}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Individual Expenses */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5 xs:mb-2 sm:mb-3 text-[11px] xs:text-xs sm:text-sm md:text-base">{t('individualExpenses')}</h3>
                    <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4">
                      {materials.map(material => {
                        const unitRate = (material.price / material.quantity.value).toFixed(2);
                        const materialTypeLabel = translateValue(materialTypeMap, material.materialType, lang);
                        const quantityUnitLabel = translateValue(quantityUnitMap, material.quantity.unit, lang);
                        const genderLabel = material.materialType === 'मजदूरी' && material.gender
                          ? `(${translateValue(genderMap, material.gender, lang)})`
                          : '';
                        return (
                          <div key={material._id} className="border rounded-md xs:rounded-lg p-2.5 xs:p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-start gap-1.5 xs:gap-2 mb-1.5 xs:mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-[11px] xs:text-xs sm:text-sm md:text-base">{material.materialName} {genderLabel}</h3>
                                <p className="text-[10px] xs:text-[11px] sm:text-xs text-gray-600">{materialTypeLabel}</p>
                              </div>
                              <span className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-primary">₹{material.price.toFixed(2)}</span>
                            </div>
                            <div className="text-[10px] xs:text-[11px] sm:text-xs text-gray-600 space-y-0.5 xs:space-y-1">
                              <p>📅 {new Date(material.date).toLocaleDateString(dateLocale)}</p>
                              <p>📦 {t('quantity')}: {material.quantity.value} {quantityUnitLabel} × ₹{unitRate}/{quantityUnitLabel} = ₹{material.price.toFixed(2)}</p>
                              {material.notes && <p>📝 {material.notes}</p>}
                            </div>
                            <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2 mt-2 xs:mt-2.5 sm:mt-3">
                              <button
                                onClick={() => navigate(`/crop/${id}/edit-material/${material._id}`)}
                                className="flex-1 px-2.5 xs:px-3 py-1.5 xs:py-2 bg-blue-100 text-blue-700 text-[11px] xs:text-xs sm:text-sm rounded hover:bg-blue-200 transition-colors"
                              >
                                ✏️ {t('edit')}
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(t('deleteExpenseConfirm'))) {
                                    try {
                                      await deleteMaterial(material._id);
                                      fetchData();
                                    } catch (err) {
                                      alert(t('expenseDeleteError'));
                                    }
                                  }
                                }}
                                className="flex-1 px-2.5 xs:px-3 py-1.5 xs:py-2 bg-red-100 text-red-700 text-[11px] xs:text-xs sm:text-sm rounded hover:bg-red-200 transition-colors"
                              >
                                🗑️ {t('deleteCrop')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Complete Crop Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2.5 xs:p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full p-3 xs:p-4 sm:p-5 md:p-6">
            <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2.5 xs:mb-3 sm:mb-4">{t('completeCropTitle')}</h3>
            
            <form onSubmit={handleCompleteCrop} className="space-y-2.5 xs:space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1.5 xs:mb-2 text-[11px] xs:text-xs sm:text-sm md:text-base">{t('productionQty')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={production.quantity}
                  onChange={(e) => setProduction({...production, quantity: e.target.value})}
                  placeholder={t('quantityPlaceholderExample')}
                  required
                  className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-[11px] xs:text-xs sm:text-sm md:text-base border border-gray-300 rounded-md xs:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1.5 xs:mb-2 text-[11px] xs:text-xs sm:text-sm md:text-base">{t('unit')}</label>
                <select
                  value={production.unit}
                  onChange={(e) => setProduction({...production, unit: e.target.value})}
                  className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-[11px] xs:text-xs sm:text-sm md:text-base border border-gray-300 rounded-md xs:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.keys(productionUnitMap).map((value) => (
                    <option key={value} value={value}>{translateValue(productionUnitMap, value, lang)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1.5 xs:mb-2 text-[11px] xs:text-xs sm:text-sm md:text-base">{t('sellingPrice')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={production.sellingPrice}
                  onChange={(e) => setProduction({...production, sellingPrice: e.target.value})}
                  placeholder={t('sellingPricePlaceholderExample')}
                  required
                  className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-[11px] xs:text-xs sm:text-sm md:text-base border border-gray-300 rounded-md xs:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2 sm:gap-3 pt-1.5 xs:pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-md xs:rounded-lg hover:bg-gray-50 text-[11px] xs:text-xs sm:text-sm md:text-base transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 xs:py-3 bg-primary text-white rounded-lg hover:bg-secondary text-sm xs:text-base"
                >
                  {t('complete')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CropDetails;
