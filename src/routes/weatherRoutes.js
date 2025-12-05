/**
 * Weather API Routes
 * Handles weather data and energy consumption forecasts
 */

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

/**
 * GET /api/weather
 * Fetch comprehensive weather data with energy consumption forecasts
 */
router.get('/', async (req, res) => {
  try {
    const data = await weatherService.fetchWeatherData();
    res.json(data);
  } catch (error) {
    console.error('Error in weather route:', error.message);
    res.status(500).json({
      error: 'Failed to fetch weather data'
    });
  }
});

module.exports = router;
