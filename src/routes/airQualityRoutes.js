/**
 * Air Quality API Routes
 * Handles air quality data for Paris
 */

const express = require('express');
const router = express.Router();
const airQualityService = require('../services/airQualityService');

/**
 * GET /api/air-quality
 * Fetch air quality data for Paris
 */
router.get('/', async (req, res) => {
  try {
    const data = await airQualityService.fetchAirQualityData();
    res.json(data);
  } catch (error) {
    console.error('Error in air-quality route:', error.message);
    res.status(500).json({
      error: 'Failed to fetch air quality data'
    });
  }
});

module.exports = router;
