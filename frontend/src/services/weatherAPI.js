// src/services/weatherAPI.js
import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // Add your API key in .env
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherByCity = async (city) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    return null;
  }
};
