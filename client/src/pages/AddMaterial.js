import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addMaterial } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

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

function AddMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    materialType: 'बीज',
    materialName: '',
    quantityValue: '',
    quantityUnit: 'किलोग्राम',
    pricePerUnit: '',
    laborDays: '1',
    totalAmount: 0,
    gender: 'mixed',
    notes: '',
    billImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const materialTypes = [
    'बीज',
    'खाद',
    'दवाई',
    'कीटनाशक',
    'मजदूरी',
    'ट्रैक्टर/उपकरण',
    'पानी/बिजली',
    'परिवहन',
    'भंडारण',
    'अन्य'
  ];

  const units = ['किलोग्राम', 'लीटर', 'पैकेट', 'बोरी', 'दिन', 'घंटा', 'पीस', 'बोतल', 'व्यक्ति'];

  // Calculate total amount automatically
  const calculateTotal = (quantity, pricePerUnit, days = 1) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(pricePerUnit) || 0;
    const laborDays = parseFloat(days) || 1;
    return qty * price * laborDays;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };

    // Recalculate total when quantity, price, or days change
    if (name === 'quantityValue' || name === 'pricePerUnit' || name === 'laborDays') {
      updatedData.totalAmount = calculateTotal(
        name === 'quantityValue' ? value : formData.quantityValue,
        name === 'pricePerUnit' ? value : formData.pricePerUnit,
        name === 'laborDays' ? value : formData.laborDays
      );
    }

    setFormData(updatedData);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('fileSizeError'));
        e.target.value = '';
        return;
      }
      setFormData({
        ...formData,
        billImage: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.quantityValue || parseFloat(formData.quantityValue) <= 0) {
      setError(t('quantityValidationError'));
      setLoading(false);
      return;
    }
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      setError(t('priceValidationError'));
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('crop', id);
      data.append('date', formData.date);
      data.append('materialType', formData.materialType);
      data.append('materialName', formData.materialName);
      data.append('quantity', JSON.stringify({
        value: parseFloat(formData.quantityValue),
        unit: formData.quantityUnit
      }));
      data.append('pricePerUnit', formData.pricePerUnit);
      data.append('price', formData.totalAmount.toString());
      data.append('laborDays', formData.laborDays);
      data.append('gender', formData.gender);
      if (formData.notes) {
        data.append('notes', formData.notes);
      }
      if (formData.billImage) {
        data.append('billImage', formData.billImage);
      }

      await addMaterial(data);
      navigate(`/crop/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || t('addExpenseError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(`/crop/${id}`)}
            className="text-primary hover:underline mb-2 flex items-center gap-1 text-sm sm:text-base"
          >
            ← {t('backToCropDetails')}
          </button>
          <h1 className="text-xl xs:text-2xl font-bold text-gray-900">{t('addExpenseTitle')}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow p-4 xs:p-5 sm:p-6">
          {error && (
            <div className="mb-4 p-3 xs:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm xs:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
              {/* Date */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-sm sm:text-base">{t('dateLabel')} *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Material Type */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-sm sm:text-base">{t('materialTypeLabel')} *</label>
                <select
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  {materialTypes.map(type => (
                    <option key={type} value={type}>{translateValue(materialTypeMap, type, lang)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Material Name */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-sm sm:text-base">
                {formData.materialType === 'ट्रैक्टर/उपकरण' ? t('tractorOwnerLabel') : t('materialNameLabel')} *
              </label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                placeholder={formData.materialType === 'ट्रैक्टर/उपकरण' ? t('tractorOwnerPlaceholder') : t('materialNamePlaceholder')}
                required
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Quantity - Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-sm sm:text-base">
                  {formData.materialType === 'ट्रैक्टर/उपकरण' ? t('hoursLabel') :
                    formData.materialType === 'मजदूरी' ? t('personsLabel') : t('quantityLabel')} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="quantityValue"
                  value={formData.quantityValue}
                  onChange={handleChange}
                  placeholder={formData.materialType === 'ट्रैक्टर/उपकरण' ? t('tractorHoursPlaceholder') : t('quantityPlaceholder')}
                  required
                  min="0.01"
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-sm sm:text-base">{t('unitLabel')} *</label>
                <select
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{translateValue(quantityUnitMap, unit, lang)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Labor Days (for labor only) */}
            {formData.materialType === 'मजदूरी' && (
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-sm sm:text-base">{t('numberOfDaysLabel')} *</label>
                <input
                  type="number"
                  step="1"
                  name="laborDays"
                  value={formData.laborDays}
                  onChange={handleChange}
                  placeholder={t('daysPlaceholder')}
                  required
                  min="1"
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            )}

            {/* Price Per Unit */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-sm sm:text-base">
                {formData.materialType === 'ट्रैक्टर/उपकरण' ? t('pricePerHourLabel') :
                  formData.materialType === 'मजदूरी' ? t('pricePerPersonLabel') : t('pricePerUnitLabel')} *
              </label>
              <input
                type="number"
                step="0.01"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                placeholder={t('pricePlaceholder')}
                required
                min="0.01"
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Total Amount Display */}
            {formData.totalAmount > 0 && (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 sm:p-5">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm sm:text-base text-gray-600">{t('totalAmountLabel')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-700">₹{formData.totalAmount.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                    {formData.quantityValue} {translateValue(quantityUnitMap, formData.quantityUnit, lang)} × ₹{formData.pricePerUnit}
                    {formData.materialType === 'मजदूरी' && formData.laborDays > 1 ? ` × ${formData.laborDays} ${t('days')}` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Gender (for labor only) */}
            {formData.materialType === 'मजदूरी' && (
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-sm sm:text-base">{t('laborTypeLabel')}</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  {Object.keys(genderMap).map((value) => (
                    <option key={value} value={value}>{translateValue(genderMap, value, lang)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Bill Image */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-sm sm:text-base">{t('billPhotoLabel')}</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <p className="text-xs sm:text-sm text-gray-500">{t('billPhotoHelp')}</p>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-sm sm:text-base">{t('notesLabel')}</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('notesPlaceholder')}
                rows="3"
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Buttons - Flexbox */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full">
              <button
                type="button"
                onClick={() => navigate(`/crop/${id}`)}
                className="flex-1 px-5 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-base sm:text-lg font-bold transition-all min-h-[48px] touch-manipulation"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base sm:text-lg transition-all active:scale-95 min-h-[48px] touch-manipulation"
              >
                {loading ? t('addingExpenseButton') : t('addExpenseButton')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddMaterial;
