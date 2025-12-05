/**
 * IZITGreen API Routes
 * Handles all endpoints related to the IZITGreen building automation system
 */

const express = require('express');
const router = express.Router();
const izitGreenService = require('../services/izitGreenService');

/**
 * GET /api/izit/sites
 * Fetch all connected sites from IZITGreen
 */
router.get('/sites', async (req, res) => {
  const result = await izitGreenService.fetchSites();
  res.json(result);
});

/**
 * GET /api/izit/clients
 * Fetch all interface clients from IZITGreen
 */
router.get('/clients', async (req, res) => {
  const result = await izitGreenService.fetchClients();
  res.json(result);
});

/**
 * GET /api/izit/status
 * Fetch complete building status with metrics
 */
router.get('/status', async (req, res) => {
  const result = await izitGreenService.fetchBuildingStatus();
  res.json(result);
});

/**
 * GET /api/izit/smart-connector/value
 * Fetch Smart Connector A Value
 */
router.get('/smart-connector/value', async (req, res) => {
  const result = await izitGreenService.fetchSmartConnectorValue();
  res.json(result);
});

/**
 * GET /api/izit/trend-samples
 * Fetch trend samples for temperature sensors
 * Query params: trendId (required), orderBy (optional)
 */
router.get('/trend-samples', async (req, res) => {
  try {
    const { trendId, orderBy } = req.query;

    if (!trendId) {
      return res.status(400).json({
        error: 'Missing required parameter: trendId'
      });
    }

    const data = await izitGreenService.fetchTrendSamples(trendId, orderBy);
    res.json(data);
  } catch (error) {
    console.error('Error in trend-samples route:', error.message);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
