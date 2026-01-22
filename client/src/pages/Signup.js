import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup as signupAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const { data } = await signupAPI(signupData);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('signupError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-100 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 relative auth-shell w-full max-w-[100vw] overflow-x-hidden">
      <div className="absolute top-4 right-4 auth-lang">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 auth-card border-2 border-emerald-200">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl mb-3">🚜</div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">{t('signupTitle')}</h2>
            <p className="text-base text-gray-600">{t('signupSubtitle')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-300 text-rose-700 rounded-lg text-base font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-bold text-sm sm:text-base">
                {t('nameLabel')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('namePlaceholder')}
                required
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-bold text-sm sm:text-base">
                {t('mobileLabel')}
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder={t('mobilePlaceholder')}
                maxLength="10"
                pattern="[0-9]{10}"
                required
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-bold text-sm sm:text-base">
                {t('passwordLabel')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('passwordPlaceholder')}
                minLength="6"
                required
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-bold text-sm sm:text-base">
                {t('confirmPasswordLabel')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('confirmPasswordPlaceholder')}
                required
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-base sm:text-lg rounded-lg shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 min-h-[48px] touch-manipulation"
            >
              {loading ? t('signupButtonLoading') : t('signupButton')}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-700 text-sm sm:text-base font-medium">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                {t('loginHere')}
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 text-sm hover:text-emerald-600 font-medium transition-colors">
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
