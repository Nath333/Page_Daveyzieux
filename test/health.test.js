/**
 * Health API Endpoint Tests
 * Tests for the /health endpoint to ensure it returns correct status information
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 3001;
const HEALTH_ENDPOINT = '/health';

/**
 * Makes an HTTP GET request to the health endpoint
 */
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: HEALTH_ENDPOINT,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout after 5 seconds'));
    });

    req.end();
  });
}

/**
 * Validates the health endpoint response
 */
function validateHealthResponse(result) {
  const errors = [];

  // Check status code
  if (result.statusCode !== 200) {
    errors.push(`Expected status code 200, got ${result.statusCode}`);
  }

  // Check response body structure
  if (!result.body.status) {
    errors.push('Missing "status" field in response');
  } else if (result.body.status !== 'healthy') {
    errors.push(`Expected status "healthy", got "${result.body.status}"`);
  }

  if (!result.body.timestamp) {
    errors.push('Missing "timestamp" field in response');
  } else {
    // Validate timestamp format (ISO 8601)
    const timestamp = new Date(result.body.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push(`Invalid timestamp format: ${result.body.timestamp}`);
    }
  }

  if (result.body.uptime === undefined || result.body.uptime === null) {
    errors.push('Missing "uptime" field in response');
  } else if (typeof result.body.uptime !== 'number' || result.body.uptime < 0) {
    errors.push(`Invalid uptime value: ${result.body.uptime}`);
  }

  // Check Content-Type header
  const contentType = result.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    errors.push(`Expected Content-Type to include "application/json", got "${contentType}"`);
  }

  return errors;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Health API Endpoint Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Testing: http://${HOST}:${PORT}${HEALTH_ENDPOINT}\n`);

  try {
    console.log('→ Sending GET request to /health endpoint...');
    const startTime = Date.now();
    const result = await testHealthEndpoint();
    const responseTime = Date.now() - startTime;

    console.log(`✓ Request completed in ${responseTime}ms\n`);

    console.log('Response Details:');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Content-Type: ${result.headers['content-type']}`);
    console.log('\nResponse Body:');
    console.log(JSON.stringify(result.body, null, 2));
    console.log('─────────────────────────────────────────────────────\n');

    console.log('→ Validating response...');
    const errors = validateHealthResponse(result);

    if (errors.length === 0) {
      console.log('✓ All validations passed!\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  Test Result: PASSED');
      console.log('═══════════════════════════════════════════════════════\n');
      process.exit(0);
    } else {
      console.log('✗ Validation errors found:\n');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('  Test Result: FAILED');
      console.log('═══════════════════════════════════════════════════════\n');
      process.exit(1);
    }
  } catch (error) {
    console.log(`✗ Test failed: ${error.message}\n`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Test Result: ERROR');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Troubleshooting:');
    console.log(`  - Make sure the server is running on port ${PORT}`);
    console.log(`  - Run: node server.js`);
    console.log(`  - Check if the server started successfully\n`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testHealthEndpoint, validateHealthResponse };
