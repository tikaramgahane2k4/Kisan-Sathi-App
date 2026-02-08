
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cropAPI } from '../services/api';
import { useTranslation } from '../i18n.jsx';

// Constants for Enums
export const CropStatus = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed'
};

const Dashboard = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    landArea: '',
    unit: 'Acre',
    location: '',
    notes: ''
  });

  useEffect(() => {
    const fetchCrops = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await cropAPI.getCrops();
          if (response.success) {
            setCrops(response.data);
          }
        } catch (err) {
          setError('Failed to load crops');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCrops();
  }, [user]);

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const cropData = {
        name: formData.name,
        startDate: formData.startDate,
        landArea: parseFloat(formData.landArea),
        unit: formData.unit,
        location: formData.location,
        notes: formData.notes,
        status: CropStatus.ACTIVE
      };

      const response = await cropAPI.createCrop(cropData);
      if (response.success) {
        setCrops([...crops, response.data]);
        setShowModal(false);
        setFormData({
          name: '',
          startDate: new Date().toISOString().split('T')[0],
          landArea: '',
          unit: 'Acre',
          location: '',
          notes: ''
        });
      }
    } catch (err) {
      setError('Failed to create crop');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCrop = (crop) => {
    setIsEditing(true);
    setEditingCropId(crop._id || crop.id);
    setFormData({
      name: crop.name || '',
      startDate: crop.startDate ? new Date(crop.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      landArea: crop.landArea || '',
      unit: crop.unit || 'Acre',
      location: crop.location || '',
      notes: crop.notes || ''
    });
    setShowModal(true);
  };

  const handleUpdateCrop = async (e) => {
    e.preventDefault();
    if (!user || !editingCropId) return;

    try {
      setLoading(true);
      const cropData = {
        name: formData.name,
        startDate: formData.startDate,
        landArea: parseFloat(formData.landArea),
        unit: formData.unit,
        location: formData.location,
        notes: formData.notes,
        status: CropStatus.ACTIVE
      };
      const response = await cropAPI.updateCrop(editingCropId, cropData);
      if (response.success) {
        setCrops(crops.map(c => (c._id || c.id) === editingCropId ? response.data : c));
        setShowModal(false);
        setIsEditing(false);
        setEditingCropId(null);
        setFormData({
          name: '',
          startDate: new Date().toISOString().split('T')[0],
          landArea: '',
          unit: 'Acre',
          location: '',
          notes: ''
        });
      }
    } catch (err) {
      setError('Failed to update crop');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!user) return;
    if (!window.confirm(t('deleteCropConfirm'))) return;
    try {
      setLoading(true);
      const response = await cropAPI.deleteCrop(cropId);
      if (response.success) {
        setCrops(crops.filter(c => (c._id || c.id) !== cropId));
      }
    } catch (err) {
      setError('Failed to delete crop');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpenses = (crop) => {
    return crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-outfit">{t('farmOverview')}</h1>
          <p className="text-slate-500">{t('manageCrops')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>{t('addNewCrop')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.length === 0 ? (
          <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t('noCrops')}</h3>
            <p className="text-slate-500 mb-6">{t('startTracking')}</p>
            <button 
              onClick={() => setShowModal(true)}
              className="text-emerald-600 font-bold hover:underline"
            >
              {t('clickAddCrop')}
            </button>
          </div>
        ) : (
          crops.map(crop => (
            <div
              key={crop._id || crop.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/crop/${crop._id || crop.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/crop/${crop._id || crop.id}`);
                }
              }}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-50/50 transition-all overflow-hidden flex flex-col cursor-pointer"
            >
              <div className={`h-2 ${crop.status === CropStatus.ACTIVE ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link to={`/crop/${crop._id || crop.id}`} className="text-xl font-bold text-slate-800 font-outfit mb-1 group-hover:text-emerald-700 transition-colors block">
                      {crop.name}
                    </Link>
                    <p className="text-sm text-slate-500">{t('startedOn', { date: new Date(crop.startDate).toLocaleDateString() })}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${crop.status === CropStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {crop.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{t('landArea')}</p>
                    <p className="text-sm font-bold text-slate-700">{crop.landArea} {crop.unit}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{t('totalExpenses')}</p>
                    <p className="text-sm font-bold text-emerald-600">₹{calculateTotalExpenses(crop).toLocaleString()}</p>
                  </div>
                </div>

                {crop.location && (
                  <div className="flex items-center text-xs text-slate-500 mb-2">
                    <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {crop.location}
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <Link to={`/crop/${crop._id || crop.id}`} className="text-xs font-medium text-slate-500 flex items-center space-x-1">
                  <span>{t('viewDetails')}</span>
                  <svg className="w-4 h-4 text-emerald-500 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleEditCrop(crop); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteCrop(crop._id || crop.id); }}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={isEditing ? handleUpdateCrop : handleAddCrop}>
                <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white font-outfit">{isEditing ? t('editCropTitle') : t('addNewCropTitle')}</h3>
                  <button type="button" onClick={() => setShowModal(false)} className="text-white hover:text-emerald-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('cropName')}</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder={t('cropName')}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('startDate')}</label>
                      <input 
                        type="date" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('landArea')}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          required 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          placeholder="0.00"
                          value={formData.landArea}
                          onChange={e => setFormData({...formData, landArea: e.target.value})}
                        />
                        <select 
                          className="absolute right-2 top-2 bottom-2 bg-white border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-600 focus:ring-1 focus:ring-emerald-500 outline-none"
                          value={formData.unit}
                          onChange={e => setFormData({...formData, unit: e.target.value})}
                        >
                          <option value="Acre">Acre</option>
                          <option value="Bigha">Bigha</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('locationOptional')}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder={t('locationOptional')}
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('notesOptional')}</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                      rows={3}
                      placeholder={t('notesOptional')}
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex space-x-3 rounded-b-3xl">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all"
                  >
                    {isEditing ? t('updateCrop') : t('saveCrop')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
