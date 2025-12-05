/**
 * Fetch Utility
 * Centralized fetch management to avoid redundant imports
 */

let fetch;

/**
 * Initialize fetch (called once at startup)
 */
async function initializeFetch() {
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }
  return fetch;
}

/**
 * Get the fetch instance
 * @returns {Function} node-fetch function
 */
function getFetch() {
  if (!fetch) {
    throw new Error('Fetch not initialized. Call initializeFetch() first.');
  }
  return fetch;
}

module.exports = {
  initializeFetch,
  getFetch
};
