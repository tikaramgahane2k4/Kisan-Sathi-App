import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCrops } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Analytics() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProfit: 0,
    avgYield: 0,
    topCrop: null,
    expenseByType: {},
    profitTrend: []
  });

  useEffect(() => {
    fetchAndAnalyze();
  }, []);

  const fetchAndAnalyze = async () => {
    try {
      const { data } = await getCrops();
      const completedCrops = data.crops.filter(c => c.status === 'पूर्ण');
      setCrops(completedCrops);

      if (completedCrops.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate stats
      const totalProfit = completedCrops.reduce((sum, c) => sum + (c.netProfit || 0), 0);
      const avgYield = completedCrops.length > 0
        ? completedCrops.reduce((sum, c) => sum + (c.production?.quantity || 0), 0) / completedCrops.length
        : 0;
      
      const topCrop = completedCrops.reduce((max, c) =>
        (c.netProfit || 0) > (max?.netProfit || 0) ? c : max
      );

      // Expense breakdown
      const expenseByType = {};
      completedCrops.forEach(crop => {
        crop.materials?.forEach(mat => {
          const type = mat.materialType || 'Other';
          expenseByType[type] = (expenseByType[type] || 0) + (mat.totalAmount || 0);
        });
      });

      setStats({
        totalProfit,
        avgYield: Math.round(avgYield * 100) / 100,
        topCrop,
        expenseByType,
        profitTrend: completedCrops.map(c => ({
          crop: c.cropType,
          profit: c.netProfit || 0,
          cost: c.totalCost || 0
        }))
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => `₹${(val || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-cyan-50 to-white flex flex-col w-full max-w-[100vw] overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 md:px-8 py-4 xs:py-6 sm:py-10 md:py-12">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4 sm:gap-6 mb-6 xs:mb-8 sm:mb-12">
            <div className="flex-1 w-full xs:w-auto">
              <h1 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {t('analyticsTitle') || 'Analytics & Insights'}
              </h1>
              <p className="text-[10px] xs:text-xs sm:text-base text-gray-600 mt-1.5 xs:mt-2">{crops.length} completed crops</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full xs:w-auto px-4 xs:px-5 sm:px-7 py-2.5 xs:py-3 sm:py-4 bg-white border-2 border-emerald-400 text-emerald-700 rounded-lg xs:rounded-xl hover:bg-emerald-50 transition-all font-bold text-xs xs:text-sm sm:text-lg shadow-lg hover:shadow-xl min-h-[40px] xs:min-h-[44px]"
            >
              ← {t('backToDashboard') || 'Back'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading analytics...</div>
          ) : crops.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 xs:p-10 sm:p-12 text-center border-2 border-emerald-200">
              <div className="text-4xl xs:text-5xl mb-4">📊</div>
              <p className="text-gray-700 text-base xs:text-lg sm:text-xl font-medium">Complete crops to see analytics.</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10 lg:mb-12 w-full auto-rows-fr">
              {/* Total Profit Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg xs:rounded-xl shadow-lg p-5 xs:p-6 sm:p-7 border-2 border-emerald-400 hover:shadow-xl transition-all">
                <div className="text-emerald-700 text-xs xs:text-sm sm:text-base font-bold">{t('totalProfit') || 'Total Profit'}</div>
                <div className={`text-2xl xs:text-3xl sm:text-4xl font-bold mt-3 xs:mt-4 ${stats.totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(stats.totalProfit)}
                </div>
                <div className="mt-3 xs:mt-4 text-xs xs:text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                  {stats.totalProfit >= 0 ? '📈 Growing' : '📉 Declining'}
                </div>
              </div>

              {/* Average Yield Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg xs:rounded-xl shadow-lg p-5 xs:p-6 sm:p-7 border-2 border-blue-400 hover:shadow-xl transition-all">
                <div className="text-blue-700 text-xs xs:text-sm sm:text-base font-bold">{t('avgYield') || 'Avg Yield'}</div>
                <div className="text-2xl xs:text-3xl sm:text-4xl font-bold text-blue-700 mt-3 xs:mt-4">{stats.avgYield}</div>
                <div className="mt-3 xs:mt-4 text-xs xs:text-sm text-blue-600 font-medium">Per crop</div>
              </div>

              {/* Completed Crops Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg xs:rounded-xl shadow-lg p-5 xs:p-6 sm:p-7 border-2 border-indigo-400 hover:shadow-xl transition-all">
                <div className="text-indigo-700 text-xs xs:text-sm sm:text-base font-bold">{t('completedCrops') || 'Completed Crops'}</div>
                <div className="text-2xl xs:text-3xl sm:text-4xl font-bold text-indigo-700 mt-3 xs:mt-4">{crops.length}</div>
                <div className="mt-3 xs:mt-4 text-xs xs:text-sm text-indigo-600 font-medium">Total harvested</div>
              </div>

              {/* Top Performer Card */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg xs:rounded-xl shadow-lg p-5 xs:p-6 sm:p-7 border-2 border-amber-400 hover:shadow-xl transition-all">
                <div className="text-amber-700 text-xs xs:text-sm sm:text-base font-bold">{t('topPerformer') || 'Top Crop'}</div>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-amber-700 mt-3 xs:mt-4">
                  {stats.topCrop?.cropType || 'N/A'}
                </div>
                <div className="text-sm xs:text-base font-bold text-amber-600 mt-1.5">{formatCurrency(stats.topCrop?.netProfit || 0)}</div>
              </div>
            </div>

          {/* Expense Breakdown */}
          {Object.keys(stats.expenseByType).length > 0 && (
            <div className="bg-white rounded-lg xs:rounded-xl shadow-lg p-5 xs:p-6 sm:p-8 mb-8 xs:mb-10 sm:mb-12 border-2 border-gray-200">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-6 xs:mb-8 flex items-center gap-2">
                💰 {t('expensesBreakdown') || 'Expenses by Type'}
              </h2>
              <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                {Object.entries(stats.expenseByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, amount], idx) => {
                    const colors = ['from-blue-400 to-cyan-400', 'from-emerald-400 to-teal-400', 'from-amber-400 to-orange-400', 'from-rose-400 to-pink-400', 'from-purple-400 to-indigo-400'];
                    const bgColors = ['bg-blue-100', 'bg-emerald-100', 'bg-amber-100', 'bg-rose-100', 'bg-purple-100'];
                    const color = colors[idx % colors.length];
                    const bgColor = bgColors[idx % bgColors.length];
                    const percentage = (amount / Object.values(stats.expenseByType).reduce((a, b) => a + b)) * 100;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm xs:text-base">{type}</span>
                          <span className={`font-bold text-lg xs:text-xl ${bgColor} px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg`}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className={`h-3 xs:h-4 rounded-full bg-gradient-to-r ${color} shadow-lg`} style={{width: `${percentage}%`}}></div>
                        <div className="text-[10px] xs:text-xs text-gray-500 text-right">{Math.round(percentage)}% of total</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Profit Trend */}
          {stats.profitTrend.length > 0 && (
            <div className="bg-white rounded-lg xs:rounded-xl shadow-lg p-5 xs:p-6 sm:p-8 border-2 border-gray-200">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-6 xs:mb-8 flex items-center gap-2">
                📈 {t('profitTrend') || 'Profit Trend'}
              </h2>
              <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                {stats.profitTrend.map((item, idx) => (
                  <div key={idx} className="border-b-2 border-gray-200 pb-4 xs:pb-5 sm:pb-6 last:border-b-0">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 mb-3">
                      <span className="font-bold text-gray-900 text-base xs:text-lg">{item.crop}</span>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-base xs:text-lg ${item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(item.profit)}
                        </span>
                        <span className={`text-lg xs:text-xl ${item.profit >= 0 ? '' : ''}`}>{item.profit >= 0 ? '📈' : '📉'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs xs:text-sm text-gray-600">
                      <span>💵 Cost:</span>
                      <span className="font-semibold">{formatCurrency(item.cost)}</span>
                    </div>
                    <div className="mt-3 xs:mt-4 h-2.5 xs:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.profit >= 0 ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-red-500'}`}
                        style={{width: `${Math.max(5, Math.min(100, (item.profit / Math.max(...stats.profitTrend.map(p => p.profit), 1)) * 100))}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Analytics;
