/**
 * Express Application Setup
 * Configures middleware, routes, and static file serving
 */

const express = require('express');
const path = require('path');
const config = require('./config/config');

// Middleware
const proxyMiddleware = require('./middleware/proxyMiddleware');
const requestLogger = require('./middleware/requestLogger');
const securityHeaders = require('./middleware/securityHeaders');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Routes
const izitGreenRoutes = require('./routes/izitGreenRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const airQualityRoutes = require('./routes/airQualityRoutes');

const app = express();

// Trust proxy for nginx reverse proxy
app.set('trust proxy', config.server.trustProxy);

// Security headers (applied to all routes)
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// Proxy middleware for nginx header handling
app.use(proxyMiddleware);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/izit', izitGreenRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/air-quality', airQualityRoutes);

// Root route - serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
