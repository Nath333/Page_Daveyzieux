/**
 * Proxy Middleware
 * Handles nginx reverse proxy headers and connection logging
 */

/**
 * Middleware to log and handle nginx reverse proxy headers
 * Logs connection information for debugging reverse proxy setup
 */
function proxyMiddleware(req, res, next) {
  // nginx passes the original protocol and host through headers
  const xForwardedProto = req.headers['x-forwarded-proto'];
  const xForwardedHost = req.headers['x-forwarded-host'];
  const xRealIp = req.headers['x-real-ip'];
  const xForwardedFor = req.headers['x-forwarded-for'];

  // Log connection info for debugging (useful for nginx setup)
  if (xForwardedProto || xForwardedHost) {
    const clientIp = xRealIp || xForwardedFor || req.ip;
    console.log(`[nginx] Request from ${clientIp} via ${xForwardedProto || 'http'}://${xForwardedHost || req.hostname}`);
  }

  next();
}

module.exports = proxyMiddleware;
