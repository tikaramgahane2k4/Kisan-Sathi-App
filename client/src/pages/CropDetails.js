import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCrop, completeCrop, deleteCrop, deleteMaterial } from '../utils/api';
import { generateCropPDF } from '../utils/pdfGenerator';

function CropDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      alert(err.response?.data?.message || 'त्रुटि');
    }
  };

  const handleDeleteCrop = async () => {
    if (window.confirm('क्या आप वाकई इस फसल को हटाना चाहते हैं?')) {
      try {
        await deleteCrop(id);
        navigate('/dashboard');
      } catch (err) {
        alert(err.response?.data?.message || 'त्रुटि');
      }
    }
  };

  const handleGeneratePDF = () => {
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
          <p className="text-gray-600 mb-4">फसल नहीं मिली</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-primary text-white rounded-lg"
          >
            डैशबोर्ड पर वापस जाएं
          </button>
        </div>
      </div>
    );
  }

  const totalCost = materials.reduce((sum, m) => sum + m.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:underline mb-2 flex items-center gap-1"
          >
            ← डैशबोर्ड
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{crop.cropType} - विवरण</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Crop Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">फसल जानकारी</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>फसल:</strong> {crop.cropType}</p>
                <p><strong>शुरुआत:</strong> {new Date(crop.startDate).toLocaleDateString('hi-IN')}</p>
                <p><strong>जमीन:</strong> {crop?.landSize?.value && crop?.landSize?.unit ? `${crop.landSize.value} ${crop.landSize.unit}` : 'उपलब्ध नहीं'}</p>
                <p><strong>अवधि:</strong> {crop.expectedDuration} महीने</p>
                <p>
                  <strong>स्थिति:</strong>{' '}
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    crop.status === 'चालू' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {crop.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">वित्तीय सारांश</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">कुल खर्च:</span>
                  <span className="font-semibold text-gray-900">₹{totalCost.toFixed(2)}</span>
                </div>
                {crop.status === 'पूर्ण' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700">कुल आय:</span>
                      <span className="font-semibold text-gray-900">₹{crop.totalIncome?.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="text-gray-900 font-bold">शुद्ध {crop.netProfit >= 0 ? 'लाभ' : 'हानि'}:</span>
                      <span className={`font-bold ${crop.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{Math.abs(crop.netProfit).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {crop.status === 'चालू' && (
                <>
                  <button
                    onClick={() => navigate(`/crop/${id}/add-material`)}
                    className="w-full py-3 bg-primary text-white rounded-lg hover:bg-secondary font-semibold"
                  >
                    + खर्च जोड़ें
                  </button>
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    फसल पूर्ण करें
                  </button>
                </>
              )}
              <button
                onClick={handleGeneratePDF}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                📄 PDF बनाएं
              </button>
              <button
                onClick={handleDeleteCrop}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                🗑️ फसल हटाएं
              </button>
            </div>
          </div>

          {/* Right Column - Materials List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                खर्च का विवरण ({materials.length})
              </h2>
              
              {materials.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">अभी तक कोई खर्च नहीं जोड़ा गया</p>
                  {crop.status === 'चालू' && (
                    <button
                      onClick={() => navigate(`/crop/${id}/add-material`)}
                      className="px-6 py-2 bg-primary text-white rounded-lg"
                    >
                      पहला खर्च जोड़ें
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Category Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3">प्रकार के अनुसार खर्च</h3>
                    <div className="grid grid-cols-1 gap-3">
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
                          
                          return (
                            <div key={type} className="bg-white p-3 rounded border border-blue-100">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-gray-900">{type}</span>
                                <span className="font-bold text-primary text-lg">₹{total.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {totalQty} {unit} × ₹{unitRate}/{unit} = ₹{total.toFixed(2)}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Individual Expenses */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">व्यक्तिगत खर्च</h3>
                    <div className="space-y-4">
                      {materials.map(material => {
                        const unitRate = (material.price / material.quantity.value).toFixed(2);
                        const genderLabel = material.materialType === 'मजदूरी' && material.gender ? `(${material.gender})` : '';
                        return (
                          <div key={material._id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{material.materialName} {genderLabel}</h3>
                                <p className="text-sm text-gray-600">{material.materialType}</p>
                              </div>
                              <span className="text-lg font-bold text-primary">₹{material.price.toFixed(2)}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📅 {new Date(material.date).toLocaleDateString('hi-IN')}</p>
                              <p>📦 मात्रा: {material.quantity.value} {material.quantity.unit} × ₹{unitRate}/{material.quantity.unit} = ₹{material.price.toFixed(2)}</p>
                              {material.notes && <p>📝 {material.notes}</p>}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => navigate(`/crop/${id}/edit-material/${material._id}`)}
                                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                              >
                                ✏️ संपादित करें
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('क्या आप इस खर्च को हटाना चाहते हैं?')) {
                                    try {
                                      await deleteMaterial(material._id);
                                      fetchData();
                                    } catch (err) {
                                      alert('खर्च हटाने में त्रुटि');
                                    }
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                              >
                                🗑️ हटाएं
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">फसल पूर्ण करें</h3>
            
            <form onSubmit={handleCompleteCrop} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">उत्पादन (मात्रा)</label>
                <input
                  type="number"
                  step="0.01"
                  value={production.quantity}
                  onChange={(e) => setProduction({...production, quantity: e.target.value})}
                  placeholder="जैसे: 50"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">इकाई</label>
                <select
                  value={production.unit}
                  onChange={(e) => setProduction({...production, unit: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="क्विंटल">क्विंटल</option>
                  <option value="टन">टन</option>
                  <option value="किलोग्राम">किलोग्राम</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">विक्रय मूल्य (प्रति इकाई)</label>
                <input
                  type="number"
                  step="0.01"
                  value={production.sellingPrice}
                  onChange={(e) => setProduction({...production, sellingPrice: e.target.value})}
                  placeholder="जैसे: 2000"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-secondary"
                >
                  पूर्ण करें
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
