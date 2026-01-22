import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMaterial, updateMaterial } from '../utils/api';

function EditMaterial() {
  const { id, materialId } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const calculateTotal = (quantity, pricePerUnit, days = 1) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(pricePerUnit) || 0;
    const laborDays = parseFloat(days) || 1;
    return qty * price * laborDays;
  };

  const fetchMaterial = async () => {
    try {
      const { data } = await getMaterial(materialId);
      const material = data.material;
      const pricePerUnit = material.pricePerUnit || (material.price / material.quantity.value / (material.laborDays || 1));
      const laborDays = material.laborDays || 1;
      
      setFormData({
        date: material.date.split('T')[0],
        materialType: material.materialType,
        materialName: material.materialName,
        quantityValue: material.quantity.value,
        quantityUnit: material.quantity.unit,
        pricePerUnit: pricePerUnit.toFixed(2),
        laborDays: laborDays.toString(),
        totalAmount: material.price,
        gender: material.gender || 'mixed',
        notes: material.notes || '',
        billImage: null
      });
    } catch (err) {
      setError('खर्च लोड करने में त्रुटि');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        setError('फाइल 5MB से बड़ी नहीं होनी चाहिए');
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
    setSubmitting(true);

    // Validation
    if (!formData.quantityValue || parseFloat(formData.quantityValue) <= 0) {
      setError('मात्रा 0 से अधिक होनी चाहिए');
      setSubmitting(false);
      return;
    }
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      setError('प्रति इकाई कीमत 0 से अधिक होनी चाहिए');
      setSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
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

      await updateMaterial(materialId, data);
      navigate(`/crop/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'खर्च अपडेट करने में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/crop/${id}`)}
            className="text-primary hover:underline mb-2 flex items-center gap-1"
          >
            ← फसल विवरण
          </button>
          <h1 className="text-2xl font-bold text-gray-900">खर्च संपादित करें</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">तारीख *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Material Type */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">सामग्री का प्रकार *</label>
              <select
                name="materialType"
                value={formData.materialType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {materialTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Material Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {formData.materialType === 'ट्रैक्टर/उपकरण' ? 'ट्रैक्टर मालिक का नाम *' : 'सामग्री का नाम *'}
              </label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                placeholder={formData.materialType === 'ट्रैक्टर/उपकरण' ? 'जैसे: राम सिंह' : 'जैसे: यूरिया, DAP, मजदूर आदि'}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {formData.materialType === 'ट्रैक्टर/उपकरण' ? 'घंटे *' : 
                   formData.materialType === 'मजदूरी' ? 'व्यक्ति *' : 'मात्रा *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="quantityValue"
                  value={formData.quantityValue}
                  onChange={handleChange}
                  placeholder={formData.materialType === 'ट्रैक्टर/उपकरण' ? 'जैसे: 2.5' : 'जैसे: 50'}
                  required
                  min="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">इकाई *</label>
                <select
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Labor Days (for labor only) */}
            {formData.materialType === 'मजदूरी' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">दिनों की संख्या *</label>
                <input
                  type="number"
                  step="1"
                  name="laborDays"
                  value={formData.laborDays}
                  onChange={handleChange}
                  placeholder="जैसे: 5"
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Price Per Unit */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {formData.materialType === 'ट्रैक्टर/उपकरण' ? 'प्रति घंटा दर (₹) *' :
                 formData.materialType === 'मजदूरी' ? 'प्रति व्यक्ति दर (₹) *' : 'प्रति इकाई कीमत (₹) *'}
              </label>
              <input
                type="number"
                step="0.01"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                placeholder="जैसे: 250"
                required
                min="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Total Amount Display */}
            {formData.totalAmount > 0 && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">कुल राशि</p>
                  <p className="text-3xl font-bold text-green-700">₹{formData.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.quantityValue} {formData.quantityUnit} × ₹{formData.pricePerUnit}
                    {formData.materialType === 'मजदूरी' && formData.laborDays > 1 ? ` × ${formData.laborDays} दिन` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Gender (for labor only) */}
            {formData.materialType === 'मजदूरी' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">मजदूर का प्रकार</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="महिला">महिला</option>
                  <option value="पुरुष">पुरुष</option>
                  <option value="mixed">मिश्रित (दोनों)</option>
                </select>
              </div>
            )}

            {/* Bill Image */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">बिल की फोटो (वैकल्पिक)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-gray-500 mt-1">JPG, PNG, या PDF (अधिकतम 5MB)</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">नोट (वैकल्पिक)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="कोई अतिरिक्त जानकारी..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/crop/${id}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-secondary disabled:opacity-50"
              >
                {submitting ? 'संपादित किया जा रहा है...' : 'संपादित करें'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditMaterial;
