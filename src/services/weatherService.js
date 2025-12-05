/**
 * Weather Service
 * Handles weather data fetching and energy consumption calculations
 */

const config = require('../config/config');
const { getFetch } = require('../utils/fetchUtil');

/**
 * Weather code mapping to descriptions and icons
 */
const WEATHER_CODE_MAP = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '⛈️' },
  71: { description: 'Slight snow', icon: '🌨️' },
  73: { description: 'Moderate snow', icon: '❄️' },
  75: { description: 'Heavy snow', icon: '❄️' },
  77: { description: 'Snow grains', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

/**
 * Calculate energy consumption based on weather conditions
 * @param {number} temperature - Current temperature in °C
 * @param {number} humidity - Relative humidity percentage
 * @param {number} cloudCover - Cloud cover percentage
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {Object} Energy consumption breakdown
 */
function calculateEnergyConsumption(temperature, humidity, cloudCover, windSpeed) {
  const {
    optimalTemperature,
    temperatureImpactFactor,
    humidityThresholdMin,
    humidityThresholdMax,
    humidityImpact,
    maxLightingConsumption,
    windSpeedThreshold,
    windVentilationBonus
  } = config.energy;

  // Base HVAC consumption (kWh per hour)
  let hvacConsumption = 50;

  // Temperature impact on HVAC (heating/cooling needs)
  const tempDiff = Math.abs(temperature - optimalTemperature);
  hvacConsumption += tempDiff * temperatureImpactFactor;

  // Humidity impact
  if (humidity > humidityThresholdMax || humidity < humidityThresholdMin) {
    hvacConsumption += humidityImpact;
  }

  // Cloud cover impact on lighting needs
  let lightingConsumption = (cloudCover / 100) * maxLightingConsumption;

  // Wind speed impact (ventilation efficiency)
  if (windSpeed > windSpeedThreshold) {
    hvacConsumption -= windVentilationBonus;
  }

  return {
    hvac: Math.round(hvacConsumption * 10) / 10,
    lighting: Math.round(lightingConsumption * 10) / 10,
    total: Math.round((hvacConsumption + lightingConsumption) * 10) / 10
  };
}

/**
 * Fetch comprehensive weather data for Paris
 * @returns {Promise<Object>} Weather data with energy forecasts
 */
async function fetchWeatherData() {
  try {
    const fetch = getFetch();
    const { latitude, longitude, timezone } = config.weather;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}&` +
      `current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,visibility,uv_index,is_day&` +
      `hourly=temperature_2m,precipitation_probability,precipitation,weather_code,cloud_cover,visibility,uv_index,wind_speed_10m,wind_direction_10m,relative_humidity_2m,dew_point_2m,shortwave_radiation,direct_radiation&` +
      `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset,daylight_duration,sunshine_duration&` +
      `timezone=${timezone}`
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Get weather description and icon
    const currentWeatherCode = data.current.weather_code;
    const weatherInfo = WEATHER_CODE_MAP[currentWeatherCode] || {
      description: 'Unknown',
      icon: '❓'
    };

    // Calculate current energy consumption
    const currentEnergy = calculateEnergyConsumption(
      data.current.temperature_2m,
      data.current.relative_humidity_2m,
      data.current.cloud_cover,
      data.current.wind_speed_10m
    );

    // Calculate 24-hour energy forecast
    const forecast24h = data.hourly.time.slice(0, 24).map((time, i) => ({
      time,
      consumption: calculateEnergyConsumption(
        data.hourly.temperature_2m[i],
        data.hourly.relative_humidity_2m[i],
        data.hourly.cloud_cover[i],
        data.hourly.wind_speed_10m[i]
      )
    }));

    return {
      current: {
        temperature: data.current.temperature_2m,
        feels_like: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        wind_speed: data.current.wind_speed_10m,
        wind_direction: data.current.wind_direction_10m,
        precipitation: data.current.precipitation,
        pressure: data.current.pressure_msl,
        cloud_cover: data.current.cloud_cover,
        visibility: data.current.visibility,
        uv_index: data.current.uv_index,
        is_day: data.current.is_day,
        weather_description: weatherInfo.description,
        weather_icon: weatherInfo.icon,
        weather_code: currentWeatherCode
      },
      energy: {
        current: currentEnergy,
        forecast_24h: forecast24h
      },
      hourly: {
        time: data.hourly.time.slice(0, 24),
        temperature: data.hourly.temperature_2m.slice(0, 24),
        precipitation: data.hourly.precipitation.slice(0, 24),
        precipitation_probability: data.hourly.precipitation_probability.slice(0, 24),
        weather_codes: data.hourly.weather_code.slice(0, 24),
        cloud_cover: data.hourly.cloud_cover.slice(0, 24),
        visibility: data.hourly.visibility.slice(0, 24),
        uv_index: data.hourly.uv_index.slice(0, 24),
        wind_speed: data.hourly.wind_speed_10m.slice(0, 24),
        wind_direction: data.hourly.wind_direction_10m.slice(0, 24),
        humidity: data.hourly.relative_humidity_2m.slice(0, 24),
        dew_point: data.hourly.dew_point_2m.slice(0, 24),
        solar_radiation: data.hourly.shortwave_radiation.slice(0, 24),
        direct_radiation: data.hourly.direct_radiation.slice(0, 24)
      },
      daily: {
        time: data.daily.time,
        temperature_max: data.daily.temperature_2m_max,
        temperature_min: data.daily.temperature_2m_min,
        precipitation_sum: data.daily.precipitation_sum,
        precipitation_probability: data.daily.precipitation_probability_max,
        wind_speed_max: data.daily.wind_speed_10m_max,
        wind_gusts_max: data.daily.wind_gusts_10m_max,
        uv_index_max: data.daily.uv_index_max,
        sunrise: data.daily.sunrise,
        sunset: data.daily.sunset,
        daylight_duration: data.daily.daylight_duration,
        sunshine_duration: data.daily.sunshine_duration,
        weather_codes: data.daily.weather_code
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

module.exports = {
  fetchWeatherData,
  calculateEnergyConsumption
};
