import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup as signupAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      setError('पासवर्ड मेल नहीं खाते');
      return;
    }

    if (formData.password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const { data } = await signupAPI(signupData);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'पंजीकरण में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">नया खाता बनाएं</h2>
            <p className="text-gray-600">अपना पंजीकरण करें</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                नाम
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="अपना नाम डालें"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                मोबाइल नंबर
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10 अंकों का नंबर"
                maxLength="10"
                pattern="[0-9]{10}"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                पासवर्ड
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="कम से कम 6 अक्षर"
                minLength="6"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                पासवर्ड दोबारा डालें
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="पासवर्ड दोबारा डालें"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'पंजीकरण हो रहा है...' : 'पंजीकरण करें'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              पहले से खाता है?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                यहाँ लॉगिन करें
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 text-sm hover:text-gray-700">
              ← होम पेज पर वापस जाएं
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
