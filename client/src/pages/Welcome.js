import React from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            किसान प्रॉफिट मित्र
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-12">
            आपकी डिजिटल खेती डायरी
          </p>

          {/* Features */}
          <div className="grid gap-4 mb-12 text-left max-w-md mx-auto">
            <Feature icon="📝" text="खर्च का पूरा हिसाब रखें" />
            <Feature icon="📊" text="लाभ-हानि की गणना करें" />
            <Feature icon="🌾" text="सभी फसलों का रिकॉर्ड" />
            <Feature icon="📄" text="PDF रिपोर्ट बनाएं" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-secondary hover:shadow-xl"
            >
              शुरू करें
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg font-semibold text-lg shadow-md hover:bg-green-50"
            >
              लॉगिन करें
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-gray-600">
        <p className="text-sm">भारतीय किसानों के लिए बनाया गया</p>
      </div>
    </div>
  );
}

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow">
    <span className="text-2xl">{icon}</span>
    <span className="text-gray-700 font-medium">{text}</span>
  </div>
);

export default Welcome;
