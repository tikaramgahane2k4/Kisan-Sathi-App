import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { sendNotification } from './NotificationBanner';

const fetchForecast = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max',
    current: 'temperature_2m,relativehumidity_2m,weathercode,windspeed_10m',
    timezone: 'auto'
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
};

const geocodeCity = async (q) => {
  const params = new URLSearchParams({ name: q, count: 1, language: 'en', format: 'json' });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  const place = data?.results?.[0];
  if (!place) throw new Error('City not found');
  return { lat: place.latitude, lon: place.longitude, label: `${place.name}${place.country ? ', ' + place.country : ''}` };
};

const getWeatherIcon = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '⛈️';
  return '🌦️';
};

const makeAdvisory = (t, tMax, rainMm) => {
  if (rainMm >= 10) {
    sendNotification('⚠️ Heavy Rain Alert', {
      body: t('heavyRainAdvice'),
      tag: 'weather-alert'
    });
    return t('heavyRainAdvice');
  }
  if (rainMm >= 2) {
    sendNotification('🌧️ Moderate Rain', {
      body: t('moderateRainAdvice'),
      tag: 'weather-alert'
    });
    return t('moderateRainAdvice');
  }
  if (tMax >= 38) {
    sendNotification('🔥 High Temperature', {
      body: t('highTempAdvice'),
      tag: 'weather-alert'
    });
    return t('highTempAdvice');
  }
  return t('normalAdvice');
};

function WeatherWidget() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // 7-day forecast
  const [showFullForecast, setShowFullForecast] = useState(false);

  useEffect(() => {
    const tryGeo = async () => {
      setLoading(true);
      setError('');
      if (!('geolocation' in navigator)) {
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const data = await fetchForecast(latitude, longitude);
          
          // Current weather
          setCurrentWeather({
            temp: data?.current?.temperature_2m,
            humidity: data?.current?.relativehumidity_2m,
            windSpeed: data?.current?.windspeed_10m,
            icon: getWeatherIcon(data?.current?.weathercode)
          });

          // 7-day forecast
          const forecastData = [];
          for (let i = 0; i < 7; i++) {
            forecastData.push({
              date: data?.daily?.time?.[i],
              tMax: data?.daily?.temperature_2m_max?.[i],
              tMin: data?.daily?.temperature_2m_min?.[i],
              rain: data?.daily?.precipitation_sum?.[i],
              windSpeed: data?.daily?.windspeed_10m_max?.[i],
              icon: getWeatherIcon(data?.daily?.weathercode?.[i])
            });
          }
          setForecast(forecastData);
          setLocationLabel(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);

          // Check for alerts on first day
          const today = forecastData[0];
          if (today.rain >= 10 || today.tMax >= 38) {
            makeAdvisory(t, today.tMax, today.rain);
          }
        } catch (e) {
          setError(e.message || 'Failed to load weather');
        } finally {
          setLoading(false);
        }
      }, () => {
        setLoading(false);
      }, { enableHighAccuracy: true, timeout: 8000 });
    };
    tryGeo();
  }, [t]);

  const onSearchCity = async (e) => {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { lat, lon, label } = await geocodeCity(cityQuery.trim());
      const data = await fetchForecast(lat, lon);
      
      // Current weather
      setCurrentWeather({
        temp: data?.current?.temperature_2m,
        humidity: data?.current?.relativehumidity_2m,
        windSpeed: data?.current?.windspeed_10m,
        icon: getWeatherIcon(data?.current?.weathercode)
      });

      // 7-day forecast
      const forecastData = [];
      for (let i = 0; i < 7; i++) {
        forecastData.push({
          date: data?.daily?.time?.[i],
          tMax: data?.daily?.temperature_2m_max?.[i],
          tMin: data?.daily?.temperature_2m_min?.[i],
          rain: data?.daily?.precipitation_sum?.[i],
          windSpeed: data?.daily?.windspeed_10m_max?.[i],
          icon: getWeatherIcon(data?.daily?.weathercode?.[i])
        });
      }
      setForecast(forecastData);
      setLocationLabel(label);

      // Check for alerts
      const today = forecastData[0];
      if (today.rain >= 10 || today.tMax >= 38) {
        makeAdvisory(t, today.tMax, today.rain);
      }
    } catch (e) {
      setError(e.message || 'City lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const card = (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-md xs:rounded-lg shadow-lg border-2 border-blue-200 p-3 xs:p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 xs:mb-3">
        <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-1.5 xs:gap-2">
          🌤️ {t('weatherTitle')}
        </h2>
        <button
          onClick={() => setShowFullForecast(!showFullForecast)}
          className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-2.5 py-1 xs:py-1.5 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-all"
        >
          {showFullForecast ? '▲' : '▼'} 7-Day
        </button>
      </div>

      <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mb-2 xs:mb-3">
        📍 {locationLabel || t('enableLocation')}
      </div>

      {/* Search City */}
      <form onSubmit={onSearchCity} className="mb-3 xs:mb-4">
        <div className="flex gap-1.5 xs:gap-2">
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search city...' : lang === 'mr' ? 'शहर शोधा...' : 'शहर खोजें...'}
            className="flex-1 px-2 xs:px-3 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[32px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-2.5 xs:px-3 py-1.5 xs:py-2 bg-blue-600 text-white rounded-md text-[10px] xs:text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50 min-h-[32px]"
          >
            🔍
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-xs xs:text-sm text-gray-600 text-center py-4">{t('fetchingWeather')}</div>
      ) : error ? (
        <div className="text-xs xs:text-sm text-red-600 text-center py-4">{error}</div>
      ) : currentWeather && forecast.length > 0 ? (
        <>
          {/* Current Weather */}
          <div className="bg-white rounded-md xs:rounded-lg p-3 xs:p-4 mb-3 xs:mb-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl xs:text-3xl sm:text-4xl mb-1">{currentWeather.icon}</div>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">{Math.round(currentWeather.temp)}°C</div>
                <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600">Now</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] xs:text-xs sm:text-sm">
                  <span className="text-gray-600">💧 Humidity:</span>
                  <span className="font-bold ml-1">{currentWeather.humidity}%</span>
                </div>
                <div className="text-[10px] xs:text-xs sm:text-sm">
                  <span className="text-gray-600">💨 Wind:</span>
                  <span className="font-bold ml-1">{Math.round(currentWeather.windSpeed)} km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Forecast */}
          <div className="grid grid-cols-3 gap-2 xs:gap-3 mb-3 xs:mb-4">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-md p-2 xs:p-3 border border-orange-300">
              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mb-1">Max Temp</div>
              <div className="text-base xs:text-lg sm:text-xl font-bold text-red-700">{Math.round(forecast[0].tMax)}°C</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-md p-2 xs:p-3 border border-blue-300">
              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mb-1">Min Temp</div>
              <div className="text-base xs:text-lg sm:text-xl font-bold text-blue-700">{Math.round(forecast[0].tMin)}°C</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-md p-2 xs:p-3 border border-green-300">
              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mb-1">Rain</div>
              <div className="text-base xs:text-lg sm:text-xl font-bold text-green-700">{forecast[0].rain?.toFixed(1) || 0} mm</div>
            </div>
          </div>

          {/* Weather Advisory */}
          {(forecast[0].rain >= 2 || forecast[0].tMax >= 38) && (
            <div className={`rounded-md xs:rounded-lg p-2.5 xs:p-3 mb-3 xs:mb-4 border-2 ${
              forecast[0].rain >= 10 ? 'bg-red-50 border-red-300 text-red-800' :
              forecast[0].rain >= 2 ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
              'bg-orange-50 border-orange-300 text-orange-800'
            }`}>
              <div className="font-bold text-[10px] xs:text-xs sm:text-sm mb-1">
                {forecast[0].rain >= 10 ? '⚠️ Alert' : '⚡ Advisory'}
              </div>
              <div className="text-[9px] xs:text-[10px] sm:text-xs">
                {makeAdvisory(t, forecast[0].tMax, forecast[0].rain)}
              </div>
            </div>
          )}

          {/* 7-Day Forecast (Collapsible) */}
          {showFullForecast && (
            <div className="bg-white rounded-md xs:rounded-lg p-2.5 xs:p-3 shadow-md border border-gray-200">
              <h3 className="text-[10px] xs:text-xs sm:text-sm font-bold text-gray-900 mb-2 xs:mb-3">7-Day Forecast</h3>
              <div className="space-y-1.5 xs:space-y-2">
                {forecast.slice(1, 7).map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 xs:p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <span className="text-base xs:text-lg">{day.icon}</span>
                      <div>
                        <div className="text-[10px] xs:text-xs font-bold text-gray-900">{getDayName(day.date)}</div>
                        <div className="text-[9px] xs:text-[10px] text-gray-600">{day.date?.split('-').slice(1).join('/')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 xs:gap-3 text-[9px] xs:text-[10px] sm:text-xs">
                      <span className="text-red-600 font-bold">{Math.round(day.tMax)}°</span>
                      <span className="text-blue-600 font-bold">{Math.round(day.tMin)}°</span>
                      <span className="text-green-600 font-bold">💧{day.rain?.toFixed(0) || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-xs xs:text-sm text-gray-600 text-center py-4">{t('enableLocation')}</div>
      )}

      {error && <div className="mt-2 text-[9px] xs:text-[10px] sm:text-xs text-red-600">{error}</div>}
    </div>
  );

  return (
    <section className="mb-3 xs:mb-4 sm:mb-5 md:mb-6">
      {card}
    </section>
  );
}

export default WeatherWidget;
