import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCrops, createCrop } from '../utils/api';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
      setError('जमीन का मान सही भरें (0 से ऊपर)');
      return;
    }
    if (!durationNum || durationNum <= 0) {
      setError('अवधि महीनों में सही भरें');
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
      setError(err.response?.data?.message || 'फसल बनाने में त्रुटि');
    }
  };

  const activeCrops = crops.filter(c => c.status === 'चालू');
  const completedCrops = crops.filter(c => c.status === 'पूर्ण');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">किसान प्रॉफिट मित्र</h1>
            <p className="text-sm text-gray-600">स्वागत है, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
          >
            लॉगआउट
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Crop Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-secondary flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            नई फसल शुरू करें
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Active Crops */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">चालू फसलें ({activeCrops.length})</h2>
              {activeCrops.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  कोई चालू फसल नहीं है। नई फसल शुरू करें!
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCrops.map(crop => (
                    <CropCard key={crop._id} crop={crop} onClick={() => navigate(`/crop/${crop._id}`)} />
                  ))}
                </div>
              )}
            </section>

            {/* Completed Crops */}
            {completedCrops.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">पूर्ण फसलें ({completedCrops.length})</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCrops.map(crop => (
                    <CropCard key={crop._id} crop={crop} onClick={() => navigate(`/crop/${crop._id}`)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Create Crop Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">नई फसल शुरू करें</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCrop} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">फसल चुनें (Crop)</label>
                <select
                  value={newCrop.cropType}
                  onChange={(e) => setNewCrop({...newCrop, cropType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="धान">धान (Rice)</option>
                  <option value="गेहूं">गेहूं (Wheat)</option>
                  <option value="गन्ना">गन्ना (Sugarcane)</option>
                  <option value="बैंगन">बैंगन (Brinjal)</option>
                  <option value="गोभी">गोभी (Cauliflower)</option>
                  <option value="मिर्च">मिर्च (Chilli)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">शुरुआत की तारीख</label>
                <input
                  type="date"
                  value={newCrop.startDate}
                  onChange={(e) => setNewCrop({...newCrop, startDate: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">अनुमानित अवधि (महीने)</label>
                <input
                  type="number"
                  value={newCrop.expectedDuration}
                  onChange={(e) => setNewCrop({...newCrop, expectedDuration: e.target.value})}
                  placeholder="जैसे: 4"
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">जमीन का क्षेत्रफल</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={newCrop.landSize.value}
                    onChange={(e) => setNewCrop({
                      ...newCrop,
                      landSize: { ...newCrop.landSize, value: e.target.value }
                    })}
                    placeholder="जैसे: 2.5"
                    min="0.01"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={newCrop.landSize.unit}
                    onChange={(e) => setNewCrop({
                      ...newCrop,
                      landSize: { ...newCrop.landSize, unit: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="बीघा">बीघा</option>
                    <option value="डिस्मिल">डिस्मिल</option>
                    <option value="एकड़">एकड़</option>
                    <option value="हेक्टेयर">हेक्टेयर</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-secondary"
                >
                  बनाएं
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const CropCard = ({ crop, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold text-gray-900">{crop.cropType}</h3>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        crop.status === 'चालू' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {crop.status}
      </span>
    </div>
    
    <div className="space-y-2 text-gray-600">
      <p>📅 शुरुआत: {new Date(crop.startDate).toLocaleDateString('hi-IN')}</p>
      <p>
        🌾 जमीन: {crop?.landSize?.value && crop?.landSize?.unit
          ? `${crop.landSize.value} ${crop.landSize.unit}`
          : 'उपलब्ध नहीं'}
      </p>
      <p>💰 कुल खर्च: ₹{crop.totalCost?.toFixed(2) || '0.00'}</p>
      {crop.status === 'पूर्ण' && crop.netProfit !== undefined && (
        <p className={`font-semibold ${crop.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {crop.netProfit >= 0 ? '✅ लाभ' : '❌ हानि'}: ₹{Math.abs(crop.netProfit).toFixed(2)}
        </p>
      )}
    </div>
    
    <button className="mt-4 w-full py-2 bg-primary text-white rounded-lg hover:bg-secondary">
      विवरण देखें →
    </button>
  </div>
);

export default Dashboard;
