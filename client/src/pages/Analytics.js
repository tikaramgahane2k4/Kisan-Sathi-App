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
    profitTrend: [],
    predictions: {
      nextSeasonBudget: 0,
      avgCostPerCrop: 0,
      roi: 0
    }
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
      let totalCost = 0;
      completedCrops.forEach(crop => {
        crop.materials?.forEach(mat => {
          const type = mat.materialType || 'Other';
          const amount = mat.price || mat.totalAmount || 0;
          expenseByType[type] = (expenseByType[type] || 0) + amount;
          totalCost += amount;
        });
      });

      // Predictions based on historical data
      const avgCostPerCrop = completedCrops.length > 0 ? totalCost / completedCrops.length : 0;
      const nextSeasonBudget = avgCostPerCrop * 1.1; // 10% buffer
      const roi = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

      setStats({
        totalProfit,
        avgYield: Math.round(avgYield * 100) / 100,
        topCrop,
        expenseByType,
        profitTrend: completedCrops.map(c => ({
          crop: c.cropType,
          profit: c.netProfit || 0,
          cost: c.totalCost || 0
        })),
        predictions: {
          nextSeasonBudget: Math.round(nextSeasonBudget),
          avgCostPerCrop: Math.round(avgCostPerCrop),
          roi: Math.round(roi * 10) / 10
        }
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
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4 md:gap-6 mb-4 xs:mb-6 sm:mb-8 md:mb-12">
            <div className="flex-1 w-full xs:w-auto">
              <h1 className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                {t('analyticsTitle') || 'Analytics & Insights'}
              </h1>
              <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1 xs:mt-1.5">{crops.length} completed crops</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full xs:w-auto px-3 xs:px-4 sm:px-5 md:px-7 py-2 xs:py-2.5 sm:py-3 md:py-4 bg-white border-2 border-emerald-400 text-emerald-700 rounded-md xs:rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all font-bold text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg shadow-lg hover:shadow-xl min-h-[36px] xs:min-h-[40px] sm:min-h-[44px] touch-manipulation"
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
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-3.5 sm:gap-4 md:gap-5 lg:gap-6 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 w-full auto-rows-fr">
              {/* Total Profit Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-md xs:rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 border-2 border-emerald-400 hover:shadow-xl transition-all">
                <div className="text-emerald-700 text-[10px] xs:text-xs sm:text-sm md:text-base font-bold">{t('totalProfit') || 'Total Profit'}</div>
                <div className={`text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-4 ${stats.totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(stats.totalProfit)}
                </div>
                <div className="mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-4 text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-emerald-600 font-medium flex items-center gap-1">
                  {stats.totalProfit >= 0 ? '📈 Growing' : '📉 Declining'}
                </div>
              </div>

              {/* Average Yield Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md xs:rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 border-2 border-blue-400 hover:shadow-xl transition-all">
                <div className="text-blue-700 text-[10px] xs:text-xs sm:text-sm md:text-base font-bold">{t('avgYield') || 'Avg Yield'}</div>
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-700 mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-4">{stats.avgYield}</div>
                <div className="mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-4 text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-blue-600 font-medium">Per crop</div>
              </div>

              {/* Completed Crops Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-md xs:rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 border-2 border-indigo-400 hover:shadow-xl transition-all">
                <div className="text-indigo-700 text-[10px] xs:text-xs sm:text-sm md:text-base font-bold">{t('completedCrops') || 'Completed Crops'}</div>
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-indigo-700 mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-4">{crops.length}</div>
                <div className="mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-4 text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-indigo-600 font-medium">Total harvested</div>
              </div>

              {/* Top Performer Card */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-md xs:rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 border-2 border-amber-400 hover:shadow-xl transition-all">
                <div className="text-amber-700 text-[10px] xs:text-xs sm:text-sm md:text-base font-bold">{t('topPerformer') || 'Top Crop'}</div>
                <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-amber-700 mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-4">
                  {stats.topCrop?.cropType || 'N/A'}
                </div>
                <div className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-amber-600 mt-1 xs:mt-1.5">{formatCurrency(stats.topCrop?.netProfit || 0)}</div>
              </div>
            </div>

          {/* Expense Breakdown */}
          {Object.keys(stats.expenseByType).length > 0 && (
            <div className="bg-white rounded-md xs:rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 border-2 border-gray-200">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 xs:mb-5 sm:mb-6 md:mb-7 lg:mb-8 flex items-center gap-1.5 xs:gap-2">
                💰 {t('expensesBreakdown') || 'Expenses by Type'}
              </h2>
              <div className="space-y-3 xs:space-y-3.5 sm:space-y-4 md:space-y-5 lg:space-y-6">
                {Object.entries(stats.expenseByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, amount], idx) => {
                    const colors = ['from-blue-400 to-cyan-400', 'from-emerald-400 to-teal-400', 'from-amber-400 to-orange-400', 'from-rose-400 to-pink-400', 'from-purple-400 to-indigo-400'];
                    const bgColors = ['bg-blue-100', 'bg-emerald-100', 'bg-amber-100', 'bg-rose-100', 'bg-purple-100'];
                    const color = colors[idx % colors.length];
                    const bgColor = bgColors[idx % bgColors.length];
                    const percentage = (amount / Object.values(stats.expenseByType).reduce((a, b) => a + b)) * 100;
                    return (
                      <div key={type} className="space-y-1.5 xs:space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-gray-900 text-[11px] xs:text-xs sm:text-sm md:text-base truncate">{type}</span>
                          <span className={`font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl ${bgColor} px-2 xs:px-2.5 sm:px-3 md:px-4 py-1 xs:py-1.5 sm:py-2 rounded-md xs:rounded-lg flex-shrink-0`}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className={`h-2 xs:h-2.5 sm:h-3 md:h-4 rounded-full bg-gradient-to-r ${color} shadow-lg`} style={{width: `${percentage}%`}}></div>
                        <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 text-right">{Math.round(percentage)}% of total</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Profit Trend */}
          {stats.profitTrend.length > 0 && (
            <div className="bg-white rounded-md xs:rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 border-2 border-gray-200">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 xs:mb-5 sm:mb-6 md:mb-7 lg:mb-8 flex items-center gap-1.5 xs:gap-2">
                📈 {t('profitTrend') || 'Profit Trend'}
              </h2>
              <div className="space-y-3 xs:space-y-3.5 sm:space-y-4 md:space-y-5 lg:space-y-6">
                {stats.profitTrend.map((item, idx) => (
                  <div key={idx} className="border-b-2 border-gray-200 pb-3 xs:pb-3.5 sm:pb-4 md:pb-5 lg:pb-6 last:border-b-0">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 mb-2 xs:mb-2.5 sm:mb-3">
                      <span className="font-bold text-gray-900 text-xs xs:text-sm sm:text-base md:text-lg">{item.crop}</span>
                      <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
                        <span className={`font-bold text-sm xs:text-base sm:text-lg md:text-xl ${item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(item.profit)}
                        </span>
                        <span className={`text-base xs:text-lg sm:text-xl ${item.profit >= 0 ? '' : ''}`}>{item.profit >= 0 ? '📈' : '📉'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 text-[10px] xs:text-xs sm:text-sm text-gray-600">
                      <span>💵 Cost:</span>
                      <span className="font-semibold">{formatCurrency(item.cost)}</span>
                    </div>
                    <div className="mt-2 xs:mt-2.5 sm:mt-3 md:mt-4 h-2 xs:h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
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

          {/* Predictions & Insights */}
          {stats.predictions && crops.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-md xs:rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 border-2 border-purple-300 mt-6 xs:mt-7 sm:mt-8 md:mt-10 lg:mt-12">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 xs:mb-5 sm:mb-6 flex items-center gap-1.5 xs:gap-2">
                🔮 {t('predictions') || 'Predictions & Budget Planning'}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5">
                {/* Next Season Budget */}
                <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border-2 border-purple-200 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl xs:text-2xl">💰</span>
                    <div className="text-[10px] xs:text-xs sm:text-sm text-purple-700 font-bold">
                      {t('nextSeasonBudget') || 'Est. Next Season Budget'}
                    </div>
                  </div>
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-purple-900">
                    {formatCurrency(stats.predictions.nextSeasonBudget)}
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-1">
                    Per crop (with 10% buffer)
                  </div>
                </div>

                {/* Average Cost Per Crop */}
                <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border-2 border-blue-200 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl xs:text-2xl">📊</span>
                    <div className="text-[10px] xs:text-xs sm:text-sm text-blue-700 font-bold">
                      {t('avgCostPerCrop') || 'Avg Cost Per Crop'}
                    </div>
                  </div>
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-900">
                    {formatCurrency(stats.predictions.avgCostPerCrop)}
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-1">
                    Based on {crops.length} completed crops
                  </div>
                </div>

                {/* ROI */}
                <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border-2 border-green-200 shadow-md sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl xs:text-2xl">📈</span>
                    <div className="text-[10px] xs:text-xs sm:text-sm text-green-700 font-bold">
                      {t('roi') || 'Return on Investment (ROI)'}
                    </div>
                  </div>
                  <div className={`text-lg xs:text-xl sm:text-2xl font-bold ${stats.predictions.roi >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {stats.predictions.roi >= 0 ? '+' : ''}{stats.predictions.roi}%
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-1">
                    {stats.predictions.roi > 20 ? '🎉 Excellent!' : stats.predictions.roi > 10 ? '👍 Good' : stats.predictions.roi > 0 ? '⚠️ Needs improvement' : '❌ Loss'}
                  </div>
                </div>
              </div>

              {/* Smart Recommendations */}
              <div className="mt-4 xs:mt-5 sm:mt-6 bg-white rounded-md xs:rounded-lg p-3 xs:p-4 sm:p-5 border-2 border-indigo-200">
                <h3 className="text-xs xs:text-sm sm:text-base font-bold text-indigo-900 mb-2 xs:mb-3 flex items-center gap-1.5">
                  💡 {t('smartRecommendations') || 'Smart Recommendations'}
                </h3>
                <div className="space-y-2 xs:space-y-2.5 text-[10px] xs:text-xs sm:text-sm text-gray-700">
                  {stats.predictions.roi < 10 && (
                    <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                      <span>⚠️</span>
                      <p><strong>Low ROI Alert:</strong> Consider reducing costs or switching to higher-value crops.</p>
                    </div>
                  )}
                  {stats.expenseByType['खाद'] > stats.expenseByType['बीज'] * 2 && (
                    <div className="flex items-start gap-2 bg-blue-50 p-2 rounded border border-blue-200">
                      <span>💡</span>
                      <p><strong>Fertilizer Optimization:</strong> Your fertilizer costs are high. Consider soil testing and balanced nutrition.</p>
                    </div>
                  )}
                  {stats.predictions.nextSeasonBudget > 0 && (
                    <div className="flex items-start gap-2 bg-green-50 p-2 rounded border border-green-200">
                      <span>✅</span>
                      <p><strong>Budget Planning:</strong> Allocate ₹{Math.round(stats.predictions.nextSeasonBudget)} per crop for next season.</p>
                    </div>
                  )}
                  {stats.topCrop && (
                    <div className="flex items-start gap-2 bg-purple-50 p-2 rounded border border-purple-200">
                      <span>🏆</span>
                      <p><strong>Best Performer:</strong> {stats.topCrop.cropType} gave highest profit. Consider growing more in next season.</p>
                    </div>
                  )}
                </div>
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
