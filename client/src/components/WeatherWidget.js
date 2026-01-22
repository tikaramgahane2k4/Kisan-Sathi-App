import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { sendNotification } from './NotificationBanner';

const fetchForecast = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
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
  const [today, setToday] = useState(null); // { tMax, tMin, rain }

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
          const d = data?.daily;
          const idx = 0;
          setToday({
            tMax: d?.temperature_2m_max?.[idx],
            tMin: d?.temperature_2m_min?.[idx],
            rain: d?.precipitation_sum?.[idx]
          });
          setLocationLabel(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
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
  }, []);

  const onSearchCity = async (e) => {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { lat, lon, label } = await geocodeCity(cityQuery.trim());
      const data = await fetchForecast(lat, lon);
      const d = data?.daily;
      const idx = 0;
      setToday({
        tMax: d?.temperature_2m_max?.[idx],
        tMin: d?.temperature_2m_min?.[idx],
        rain: d?.precipitation_sum?.[idx]
      });
      setLocationLabel(label);
    } catch (e) {
      setError(e.message || 'City lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const card = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{t('weatherTitle')}</h2>
        <span className="text-[10px] xs:text-xs text-gray-500">{locationLabel || t('enableLocation')}</span>
      </div>
      {loading ? (
        <div className="text-sm text-gray-600">{t('fetchingWeather')}</div>
      ) : today ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-xs text-gray-500">{t('currentTemp')}</div>
            <div className="text-lg font-semibold text-gray-900">{Math.round(today.tMax)}° / {Math.round(today.tMin)}°C</div>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-xs text-gray-500">{t('rainToday')}</div>
            <div className="text-lg font-semibold text-gray-900">{(today.rain ?? 0).toFixed(1)} mm</div>
          </div>
          <div className="bg-gray-50 rounded-md p-3 col-span-2 sm:col-span-1">
            <div className="text-xs text-gray-500">{t('advisories')}</div>
            <div className="text-sm font-medium text-gray-900">{makeAdvisory(t, today.tMax ?? 0, today.rain ?? 0)}</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600">{t('weatherUnavailable')}</div>
      )}

      <form onSubmit={onSearchCity} className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder={t('enterCity')}
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-secondary">
          {t('checkWeather')}
        </button>
      </form>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );

  return (
    <section className="mb-4 sm:mb-6 md:mb-8">
      {card}
    </section>
  );
}

export default WeatherWidget;
