/**
 * Brico Dave Analytics Dashboard - Server Entry Point
 * Professional building analytics and environmental monitoring system
 */

const app = require('./src/app');
const config = require('./src/config/config');
const { initializeFetch } = require('./src/utils/fetchUtil');

const { port, host } = config.server;
const { apiBaseUrl, username } = config.izitGreen;

// Initialize fetch utility before starting server
initializeFetch().then(() => {
  app.listen(port, host, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    Brico Dave Analytics - Environmental Dashboard          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✓ Server running on ${host}:${port}`);
  console.log(`✓ Access dashboard at: http://localhost:${port}`);
  console.log(`✓ nginx reverse proxy compatible`);
  console.log(`\n📡 IZITGreen Portal: ${apiBaseUrl}`);
  console.log(`👤 Username: ${username}`);
  console.log(`\n🌐 API Endpoints:`);
  console.log(`   - GET /api/weather                       (Weather data & energy forecasts)`);
  console.log(`   - GET /api/air-quality                   (Air quality data for Paris)`);
  console.log(`   - GET /api/izit/status                   (Complete building status)`);
  console.log(`   - GET /api/izit/sites                    (Connected sites)`);
  console.log(`   - GET /api/izit/clients                  (Interface clients)`);
  console.log(`   - GET /api/izit/smart-connector/value    (Smart Connector value)`);
  console.log(`   - GET /api/izit/trend-samples            (Trend data)`);
  console.log('\n⏳ Ready for connections...\n');
  });
}).catch(err => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
