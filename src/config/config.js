/**
 * Application Configuration
 * Centralized configuration for the Brico Dave Analytics Dashboard
 */

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    trustProxy: true // Enable for nginx reverse proxy
  },

  // IZITGreen Portal API Configuration
  izitGreen: {
    apiBaseUrl: process.env.IZIT_API_BASE || 'http://portail.izit.green:8083',
    username: process.env.IZIT_USERNAME || 'Vincent',
    password: process.env.IZIT_PASSWORD || 'Admin.1024',
    tokenValidityMs: 50 * 60 * 1000, // 50 minutes
    requestTimeout: 10000 // 10 seconds
  },

  // Weather API Configuration
  weather: {
    // Paris coordinates
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
    requestTimeout: 15000 // 15 seconds
  },

  // Air Quality API Configuration
  airQuality: {
    // Paris coordinates
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
    requestTimeout: 10000 // 10 seconds
  },

  // Building Energy Calculation Constants
  energy: {
    optimalTemperature: 20, // °C
    temperatureImpactFactor: 2.5,
    humidityThresholdMin: 30,
    humidityThresholdMax: 70,
    humidityImpact: 15,
    maxLightingConsumption: 25,
    windSpeedThreshold: 15,
    windVentilationBonus: 8
  }
};
