import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTranslation } from '../i18n.jsx';

const Profile = ({ user, onUpdateUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
    state: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.success) {
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            mobile: response.data.mobile || '',
            city: response.data.city || '',
            state: response.data.state || ''
          });
        }
      } catch (err) {
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        mobile: formData.mobile,
        city: formData.city,
        state: formData.state
      });
      
      if (response.success) {
        setSuccess(t('profileUpdated'));
        setIsEditing(false);
        if (onUpdateUser) {
          onUpdateUser(response.data);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reload original data
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.success) {
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            mobile: response.data.mobile || '',
            city: response.data.city || '',
            state: response.data.state || ''
          });
        }
      } catch (err) {
        console.error('Failed to reload profile');
      }
    };
    fetchProfile();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {t('backToDashboard')}
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-outfit">{t('myProfile')}</h1>
              <p className="text-emerald-100">{t('managePersonalInfo')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('fullName')}</label>
              <input 
                type="text" 
                required 
                disabled={!isEditing}
                className={`w-full px-5 py-3.5 border border-slate-200 rounded-xl transition-all ${
                  isEditing 
                    ? 'bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none' 
                    : 'bg-slate-100 text-slate-600 cursor-not-allowed'
                }`}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('emailAddress')}</label>
              <input 
                type="email" 
                disabled
                className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                value={formData.email}
              />
              <p className="text-xs text-slate-500 mt-1">{t('emailCannotChange')}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('mobileNumber')}</label>
              <input 
                type="tel" 
                disabled={!isEditing}
                className={`w-full px-5 py-3.5 border border-slate-200 rounded-xl transition-all ${
                  isEditing 
                    ? 'bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none' 
                    : 'bg-slate-100 text-slate-600 cursor-not-allowed'
                }`}
                placeholder="9876543210"
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('cityLabel')}</label>
              <input 
                type="text" 
                disabled={!isEditing}
                className={`w-full px-5 py-3.5 border border-slate-200 rounded-xl transition-all ${
                  isEditing 
                    ? 'bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none' 
                    : 'bg-slate-100 text-slate-600 cursor-not-allowed'
                }`}
                placeholder={t('enterCity')}
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('stateLabel')}</label>
              <input 
                type="text" 
                disabled={!isEditing}
                className={`w-full px-5 py-3.5 border border-slate-200 rounded-xl transition-all ${
                  isEditing 
                    ? 'bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none' 
                    : 'bg-slate-100 text-slate-600 cursor-not-allowed'
                }`}
                placeholder={t('enterState')}
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span>{t('editProfile')}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center space-x-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>{t('saveChanges')}</span>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
