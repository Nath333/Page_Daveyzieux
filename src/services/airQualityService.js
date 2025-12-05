/**
 * Air Quality Service
 * Handles air quality data fetching and analysis for Paris
 */

const config = require('../config/config');
const { getFetch } = require('../utils/fetchUtil');

/**
 * Get AQI status information based on European AQI value
 * @param {number} aqi - European AQI value
 * @returns {Object} Status information with color coding
 */
function getAQIStatus(aqi) {
  if (aqi <= 20) {
    return {
      status: 'Excellent',
      color: 'var(--primary)',
      bg: 'rgba(16, 185, 129, 0.2)'
    };
  }
  if (aqi <= 40) {
    return {
      status: 'Bon',
      color: 'var(--success)',
      bg: 'rgba(34, 197, 94, 0.2)'
    };
  }
  if (aqi <= 60) {
    return {
      status: 'Moyen',
      color: 'var(--warning)',
      bg: 'rgba(245, 158, 11, 0.2)'
    };
  }
  if (aqi <= 80) {
    return {
      status: 'Médiocre',
      color: '#ff6b6b',
      bg: 'rgba(255, 107, 107, 0.2)'
    };
  }
  if (aqi <= 100) {
    return {
      status: 'Mauvais',
      color: 'var(--danger)',
      bg: 'rgba(239, 68, 68, 0.2)'
    };
  }
  return {
    status: 'Très Mauvais',
    color: '#8b0000',
    bg: 'rgba(139, 0, 0, 0.2)'
  };
}

/**
 * Fetch air quality data for Paris
 * @returns {Promise<Object>} Air quality data with AQI and pollutant levels
 */
async function fetchAirQualityData() {
  try {
    const fetch = getFetch();
    const { latitude, longitude, timezone } = config.airQuality;

    // Using Open-Meteo Air Quality API (free, no API key required)
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?` +
      `latitude=${latitude}&longitude=${longitude}&` +
      `current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,uv_index_clear_sky&` +
      `timezone=${timezone}`
    );

    if (!response.ok) {
      throw new Error(`Air quality API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aqiStatus = getAQIStatus(data.current.european_aqi);

    return {
      aqi: data.current.european_aqi,
      status: aqiStatus,
      components: {
        pm25: Math.round(data.current.pm2_5 * 10) / 10,
        pm10: Math.round(data.current.pm10 * 10) / 10,
        no2: Math.round(data.current.nitrogen_dioxide * 10) / 10,
        o3: Math.round(data.current.ozone * 10) / 10,
        co: Math.round(data.current.carbon_monoxide * 10) / 10,
        so2: Math.round(data.current.sulphur_dioxide * 10) / 10
      },
      uvIndex: data.current.uv_index,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
}

module.exports = {
  fetchAirQualityData,
  getAQIStatus
};
