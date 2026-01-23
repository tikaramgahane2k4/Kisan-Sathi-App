import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const knowledgeBaseData = {
  hi: {
    title: 'किसान ज्ञान केंद्र',
    subtitle: 'खेती की जानकारी और सुझाव',
    categories: [
      {
        id: 'crops',
        icon: '🌾',
        name: 'फसल प्रबंधन',
        tips: [
          { title: 'बीज चयन', content: 'हमेशा प्रमाणित बीज का उपयोग करें। स्थानीय कृषि विभाग से उन्नत किस्मों की जानकारी लें। बीज उपचार जरूर करें।' },
          { title: 'फसल चक्र', content: 'लगातार एक ही फसल न उगाएं। धान के बाद दलहन, गेहूं के बाद सब्जी उगाने से मिट्टी की उर्वरता बढ़ती है।' },
          { title: 'बुवाई का समय', content: 'सही समय पर बुवाई करें। देर से बुवाई पैदावार कम कर देती है। मौसम विभाग की सलाह जरूर लें।' }
        ]
      },
      {
        id: 'pest',
        icon: '🐛',
        name: 'कीट व रोग नियंत्रण',
        tips: [
          { title: 'जैविक नियंत्रण', content: 'नीम का तेल, लहसुन का घोल प्रयोग करें। रासायनिक कीटनाशक कम से कम प्रयोग करें।' },
          { title: 'रोग पहचान', content: 'पत्तियों पर धब्बे, पीलापन, मुरझाना - ये रोग के लक्षण हैं। तुरंत कृषि विशेषज्ञ से सलाह लें।' },
          { title: 'रोकथाम', content: 'खेत साफ रखें। रोगग्रस्त पौधे हटा दें। उचित दूरी पर रोपाई करें।' }
        ]
      },
      {
        id: 'soil',
        icon: '🌱',
        name: 'मिट्टी और खाद',
        tips: [
          { title: 'मिट्टी परीक्षण', content: 'हर 2-3 साल में मिट्टी की जांच कराएं। इससे सही खाद की मात्रा पता चलती है।' },
          { title: 'जैविक खाद', content: 'गोबर की खाद, कंपोस्ट, वर्मीकंपोस्ट का प्रयोग करें। ये मिट्टी की सेहत सुधारते हैं।' },
          { title: 'संतुलित पोषण', content: 'NPK का संतुलित प्रयोग करें। अधिक यूरिया हानिकारक है। सूक्ष्म पोषक तत्व भी जरूरी हैं।' }
        ]
      },
      {
        id: 'water',
        icon: '💧',
        name: 'सिंचाई प्रबंधन',
        tips: [
          { title: 'ड्रिप सिंचाई', content: 'ड्रिप से 40-50% पानी बचता है। सब्जी और फलों के लिए बेहतर है।' },
          { title: 'सिंचाई का समय', content: 'सुबह या शाम को सिंचाई करें। दोपहर में पानी का वाष्पीकरण ज्यादा होता है।' },
          { title: 'जल संरक्षण', content: 'तालाब बनाएं। वर्षा जल संचय करें। मल्चिंग से नमी बनाए रखें।' }
        ]
      },
      {
        id: 'market',
        icon: '💰',
        name: 'विपणन और लाभ',
        tips: [
          { title: 'बाजार जानकारी', content: 'मंडी भाव रोज देखें। ई-नाम पोर्टल पर रजिस्टर करें। सही समय पर बेचें।' },
          { title: 'सीधी बिक्री', content: 'बिचौलिए हटाकर सीधे बेचें। FPO में शामिल हों। ऑनलाइन मार्केट आज़माएं।' },
          { title: 'मूल्य संवर्धन', content: 'प्रसंस्करण से कीमत बढ़ती है। पैकेजिंग अच्छी करें। ब्रांडिंग पर ध्यान दें।' }
        ]
      },
      {
        id: 'govt',
        icon: '🏛️',
        name: 'सरकारी योजनाएं',
        tips: [
          { title: 'PM-KISAN', content: '₹6000/वर्ष सीधे खाते में। ऑनलाइन आवेदन करें। आधार लिंक जरूरी।' },
          { title: 'फसल बीमा', content: 'PMFBY योजना में शामिल हों। प्राकृतिक आपदा से सुरक्षा। कम प्रीमियम।' },
          { title: 'किसान क्रेडिट कार्ड', content: 'कम ब्याज पर लोन। बीज, खाद खरीदने के लिए। 4% ब्याज दर।' }
        ]
      }
    ]
  },
  en: {
    title: 'Farmer Knowledge Center',
    subtitle: 'Farming Information and Tips',
    categories: [
      {
        id: 'crops',
        icon: '🌾',
        name: 'Crop Management',
        tips: [
          { title: 'Seed Selection', content: 'Always use certified seeds. Get info on improved varieties from local agriculture dept. Seed treatment is essential.' },
          { title: 'Crop Rotation', content: 'Don\'t grow same crop continuously. Growing pulses after rice, vegetables after wheat improves soil fertility.' },
          { title: 'Sowing Time', content: 'Sow at the right time. Late sowing reduces yield. Follow weather department advisories.' }
        ]
      },
      {
        id: 'pest',
        icon: '🐛',
        name: 'Pest & Disease Control',
        tips: [
          { title: 'Organic Control', content: 'Use neem oil, garlic solution. Minimize chemical pesticides usage.' },
          { title: 'Disease Identification', content: 'Leaf spots, yellowing, wilting are disease symptoms. Consult agriculture expert immediately.' },
          { title: 'Prevention', content: 'Keep field clean. Remove diseased plants. Plant at proper spacing.' }
        ]
      },
      {
        id: 'soil',
        icon: '🌱',
        name: 'Soil & Fertilizer',
        tips: [
          { title: 'Soil Testing', content: 'Test soil every 2-3 years. Helps determine right fertilizer quantity.' },
          { title: 'Organic Manure', content: 'Use FYM, compost, vermicompost. They improve soil health.' },
          { title: 'Balanced Nutrition', content: 'Use balanced NPK. Excessive urea is harmful. Micronutrients are also important.' }
        ]
      },
      {
        id: 'water',
        icon: '💧',
        name: 'Irrigation Management',
        tips: [
          { title: 'Drip Irrigation', content: 'Drip saves 40-50% water. Better for vegetables and fruits.' },
          { title: 'Irrigation Timing', content: 'Irrigate morning or evening. Noon irrigation has high evaporation.' },
          { title: 'Water Conservation', content: 'Build ponds. Harvest rainwater. Use mulching to retain moisture.' }
        ]
      },
      {
        id: 'market',
        icon: '💰',
        name: 'Marketing & Profit',
        tips: [
          { title: 'Market Information', content: 'Check mandi rates daily. Register on e-NAM portal. Sell at right time.' },
          { title: 'Direct Selling', content: 'Eliminate middlemen, sell directly. Join FPO. Try online markets.' },
          { title: 'Value Addition', content: 'Processing increases price. Good packaging. Focus on branding.' }
        ]
      },
      {
        id: 'govt',
        icon: '🏛️',
        name: 'Government Schemes',
        tips: [
          { title: 'PM-KISAN', content: '₹6000/year direct to account. Apply online. Aadhaar linking mandatory.' },
          { title: 'Crop Insurance', content: 'Join PMFBY scheme. Protection from natural disasters. Low premium.' },
          { title: 'Kisan Credit Card', content: 'Low interest loan. For buying seeds, fertilizers. 4% interest rate.' }
        ]
      }
    ]
  },
  mr: {
    title: 'शेतकरी ज्ञान केंद्र',
    subtitle: 'शेतीची माहिती आणि सल्ले',
    categories: [
      {
        id: 'crops',
        icon: '🌾',
        name: 'पीक व्यवस्थापन',
        tips: [
          { title: 'बियाणे निवड', content: 'नेहमी प्रमाणित बियाणे वापरा. स्थानिक कृषी विभागाकडून सुधारित जातींची माहिती घ्या.' },
          { title: 'पीक आवर्तन', content: 'सतत एकच पीक घेऊ नका. तांदळानंतर डाळी, गहूनंतर भाजी घेतल्यास जमिनीची सुपीकता वाढते.' },
          { title: 'पेरणीची वेळ', content: 'योग्य वेळी पेरणी करा. उशिरा पेरणी उत्पादन कमी करते.' }
        ]
      },
      {
        id: 'pest',
        icon: '🐛',
        name: 'किडरोग नियंत्रण',
        tips: [
          { title: 'सेंद्रिय नियंत्रण', content: 'लिंबाचे तेल, लसूण द्रावण वापरा. रासायनिक कीटकनाशकं कमी वापरा.' },
          { title: 'रोग ओळख', content: 'पानांवर डाग, पिवळेपणा, वाळवणे - हे रोगाचे लक्षण आहेत.' },
          { title: 'प्रतिबंध', content: 'शेत स्वच्छ ठेवा. रोगग्रस्त झाडं काढून टाका.' }
        ]
      },
      {
        id: 'soil',
        icon: '🌱',
        name: 'माती आणि खत',
        tips: [
          { title: 'माती तपासणी', content: 'दर 2-3 वर्षांनी माती तपासणी करा. योग्य खताचं प्रमाण कळतं.' },
          { title: 'सेंद्रिय खत', content: 'शेणखत, कंपोस्ट, केंचू खत वापरा. मातीची आरोग्य सुधारतं.' },
          { title: 'संतुलित पोषण', content: 'NPK चा संतुलित वापर करा. जास्त युरिया हानीकारक आहे.' }
        ]
      },
      {
        id: 'water',
        icon: '💧',
        name: 'सिंचन व्यवस्थापन',
        tips: [
          { title: 'ठिबक सिंचन', content: 'ठिबकाने 40-50% पाणी वाचतं. भाज्या आणि फळांसाठी चांगलं.' },
          { title: 'सिंचनाची वेळ', content: 'सकाळी किंवा संध्याकाळी सिंचन करा. दुपारी पाण्याचं बाष्पीभवन जास्त.' },
          { title: 'जल संधारण', content: 'तलाव बांधा. पावसाचं पाणी साठवा. मल्चिंग करा.' }
        ]
      },
      {
        id: 'market',
        icon: '💰',
        name: 'विपणन आणि नफा',
        tips: [
          { title: 'बाजार माहिती', content: 'रोज मंडी भाव पहा. ई-नाम वर नोंदणी करा. योग्य वेळी विक्री करा.' },
          { title: 'थेट विक्री', content: 'मध्यस्थ काढून थेट विका. FPO मध्ये सहभागी व्हा.' },
          { title: 'मूल्यवर्धन', content: 'प्रक्रिया केल्याने किंमत वाढते. चांगली पॅकेजिंग करा.' }
        ]
      },
      {
        id: 'govt',
        icon: '🏛️',
        name: 'शासकीय योजना',
        tips: [
          { title: 'PM-KISAN', content: '₹6000/वर्ष थेट खात्यात. ऑनलाइन अर्ज करा.' },
          { title: 'पीक विमा', content: 'PMFBY योजनेत सामील व्हा. नैसर्गिक आपत्तीपासून संरक्षण.' },
          { title: 'किसान क्रेडिट कार्ड', content: 'कमी व्याजावर कर्ज. बियाणे, खत खरेदीसाठी.' }
        ]
      }
    ]
  }
};

function KnowledgeBase() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('crops');
  const [searchTerm, setSearchTerm] = useState('');

  const data = knowledgeBaseData[lang] || knowledgeBaseData.hi;
  const currentCategory = data.categories.find(c => c.id === selectedCategory);
  const filteredTips = currentCategory?.tips.filter(tip =>
    (tip.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tip.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex flex-col w-full max-w-[100vw] overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 md:py-8">
          {/* Header */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 mb-4 xs:mb-6">
            <div>
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2">
                📚 {data.title}
              </h1>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-600 mt-1">{data.subtitle}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full xs:w-auto px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 bg-white border-2 border-emerald-400 text-emerald-700 rounded-md xs:rounded-lg hover:bg-emerald-50 transition-all font-bold text-[10px] xs:text-xs sm:text-sm shadow-lg min-h-[36px] xs:min-h-[40px]"
            >
              ← Back
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 xs:mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'en' ? 'Search tips...' : lang === 'mr' ? 'सल्ले शोधा...' : 'सुझाव खोजें...'}
              className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 border-2 border-gray-300 rounded-md xs:rounded-lg text-[11px] xs:text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
            />
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6">
            {data.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center gap-1.5 xs:gap-2 p-3 xs:p-4 sm:p-5 rounded-md xs:rounded-lg sm:rounded-xl border-2 transition-all min-h-[80px] xs:min-h-[90px] sm:min-h-[100px] ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-emerald-600 shadow-xl scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400 hover:shadow-lg'
                }`}
              >
                <span className="text-2xl xs:text-3xl sm:text-4xl">{cat.icon}</span>
                <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Tips Display */}
          <div className="bg-white rounded-md xs:rounded-lg sm:rounded-xl shadow-lg border-2 border-gray-200 p-3 xs:p-4 sm:p-5 md:p-6">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-5 flex items-center gap-2">
              {currentCategory?.icon} {currentCategory?.name}
            </h2>
            
            {filteredTips.length === 0 ? (
              <div className="text-center py-8 xs:py-10 sm:py-12 text-gray-500">
                <p className="text-xs xs:text-sm sm:text-base">{lang === 'en' ? 'No tips found' : lang === 'mr' ? 'सल्ले सापडले नाहीत' : 'कोई सुझाव नहीं मिला'}</p>
              </div>
            ) : (
              <div className="space-y-3 xs:space-y-4 sm:space-y-5">
                {filteredTips.map((tip, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 hover:shadow-lg transition-all">
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-emerald-800 mb-2 xs:mb-3 flex items-center gap-2">
                      <span className="text-emerald-600">✓</span>
                      {tip.title}
                    </h3>
                    <p className="text-[11px] xs:text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                      {tip.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-6 xs:mt-8 bg-blue-50 border-2 border-blue-300 rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5">
            <h3 className="text-xs xs:text-sm sm:text-base font-bold text-blue-900 mb-2 xs:mb-3 flex items-center gap-2">
              🔗 {lang === 'en' ? 'Useful Links' : lang === 'mr' ? 'उपयुक्त लिंक्स' : 'उपयोगी लिंक'}
            </h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 text-[10px] xs:text-xs sm:text-sm">
              <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">📊 AGMARKNET - Market Prices</a>
              <a href="https://www.enam.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">🌐 e-NAM Portal</a>
              <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">💰 PM-KISAN Status</a>
              <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">🛡️ Crop Insurance</a>
              <a href="https://mkisan.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">📱 mKisan Portal</a>
              <a href="https://icar.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">🔬 ICAR - Research</a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default KnowledgeBase;
