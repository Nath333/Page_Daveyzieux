/**
 * Request Logging Middleware
 * Logs incoming HTTP requests with timing information
 */

/**
 * Simple request logger middleware
 * Logs method, URL, status code, and response time
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // Determine log level based on status code
    const logLevel = res.statusCode >= 500 ? '✗' :
                     res.statusCode >= 400 ? '⚠' :
                     '✓';

    console.log(
      `${logLevel} [${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

module.exports = requestLogger;
