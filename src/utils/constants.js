/**
 * Application Constants
 * Centralized location for all application constants
 */

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Cache Durations (in milliseconds)
  CACHE_DURATION: {
    SHORT: 60 * 1000,           // 1 minute
    MEDIUM: 5 * 60 * 1000,      // 5 minutes
    LONG: 15 * 60 * 1000,       // 15 minutes
    VERY_LONG: 60 * 60 * 1000   // 1 hour
  },

  // API Timeouts (in milliseconds)
  TIMEOUT: {
    DEFAULT: 10000,    // 10 seconds
    LONG: 30000,       // 30 seconds
    SHORT: 5000        // 5 seconds
  },

  // Weather Condition Icons
  WEATHER_ICONS: {
    0: '☀️',   // Clear sky
    1: '🌤️',   // Mainly clear
    2: '⛅',   // Partly cloudy
    3: '☁️',   // Overcast
    45: '🌫️', // Fog
    48: '🌫️', // Depositing rime fog
    51: '🌧️', // Light drizzle
    61: '🌧️', // Light rain
    71: '🌨️', // Light snow
    80: '🌦️', // Rain showers
    95: '⛈️'  // Thunderstorm
  },

  // Air Quality Index Levels
  AQI_LEVELS: {
    GOOD: { min: 0, max: 50, label: 'Bon', color: '#10b981' },
    MODERATE: { min: 51, max: 100, label: 'Moyen', color: '#f59e0b' },
    UNHEALTHY_SENSITIVE: { min: 101, max: 150, label: 'Malsain (Sensible)', color: '#ef4444' },
    UNHEALTHY: { min: 151, max: 200, label: 'Malsain', color: '#dc2626' },
    VERY_UNHEALTHY: { min: 201, max: 300, label: 'Très Malsain', color: '#7c2d12' },
    HAZARDOUS: { min: 301, max: 500, label: 'Dangereux', color: '#991b1b' }
  },

  // Store Hours (Bricomarché Daveyzieux)
  STORE_HOURS: {
    MONDAY: { open: '09:00', close: '12:00', afternoonOpen: '14:00', afternoonClose: '19:00' },
    TUESDAY: { open: '09:00', close: '12:00', afternoonOpen: '14:00', afternoonClose: '19:00' },
    WEDNESDAY: { open: '09:00', close: '12:00', afternoonOpen: '14:00', afternoonClose: '19:00' },
    THURSDAY: { open: '09:00', close: '12:00', afternoonOpen: '14:00', afternoonClose: '19:00' },
    FRIDAY: { open: '09:00', close: '12:00', afternoonOpen: '14:00', afternoonClose: '19:00' },
    SATURDAY: { open: '09:00', close: '19:00' },
    SUNDAY: { closed: true }
  }
};
