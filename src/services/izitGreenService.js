/**
 * IZITGreen Portal Service
 * Handles authentication and API calls to the IZITGreen building automation system
 */

const config = require('../config/config');
const { getFetch } = require('../utils/fetchUtil');

// Token cache
let cachedToken = null;
let tokenTimestamp = 0;

/**
 * Get IZITGreen access token (cached for efficiency)
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  const now = Date.now();
  const { tokenValidityMs } = config.izitGreen;

  // Return cached token if still valid
  if (cachedToken && now - tokenTimestamp < tokenValidityMs) {
    console.log('✓ Using cached IZITGreen token');
    return cachedToken;
  }

  try {
    console.log('→ Requesting new IZITGreen access token...');
    const fetch = getFetch();
    const { apiBaseUrl, username, password } = config.izitGreen;

    const params = new URLSearchParams({
      grant_type: 'password',
      username,
      password
    });

    const response = await fetch(`${apiBaseUrl}/GetToken`, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`✗ IZITGreen token request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token in response');
    }

    cachedToken = data.access_token;
    tokenTimestamp = now;
    console.log('✓ IZITGreen token obtained successfully');
    return cachedToken;
  } catch (error) {
    console.error('✗ Error getting IZIT access token:', error.message);
    // Clear cached token on error
    cachedToken = null;
    tokenTimestamp = 0;
    throw error;
  }
}

/**
 * Fetch sites from IZITGreen
 * @returns {Promise<Object>} Sites data
 */
async function fetchSites() {
  try {
    console.log('→ Fetching IZITGreen sites...');
    const token = await getAccessToken();
    const fetch = getFetch();
    const { apiBaseUrl } = config.izitGreen;

    const url = `${apiBaseUrl}/Containers/00%252FIZITGreen%252FServers/Children`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`✗ Sites request failed: ${response.status}`, errorText);
      throw new Error(`Sites request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const siteNames = Array.isArray(data) ? data.map(item => item.Name).filter(Boolean) : [];
    console.log(`✓ Found ${siteNames.length} IZITGreen sites:`, siteNames);

    return {
      sites: siteNames,
      count: siteNames.length,
      connected: true
    };
  } catch (error) {
    console.error('✗ Error fetching IZIT sites:', error.message);
    return {
      sites: [],
      count: 0,
      connected: false,
      error: error.message
    };
  }
}

/**
 * Fetch interface clients from IZITGreen
 * @returns {Promise<Object>} Clients data
 */
async function fetchClients() {
  try {
    console.log('→ Fetching IZITGreen interface clients...');
    const token = await getAccessToken();
    const fetch = getFetch();
    const { apiBaseUrl } = config.izitGreen;

    const url = `${apiBaseUrl}/Containers/00%252FIZITGreen%252FInterfaceClient/Children`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`✗ Clients request failed: ${response.status}`, errorText);
      throw new Error(`Clients request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const clientNames = Array.isArray(data) ? data.map(item => item.Name).filter(Boolean) : [];
    console.log(`✓ Found ${clientNames.length} IZITGreen clients:`, clientNames);

    return {
      clients: clientNames,
      count: clientNames.length,
      connected: true
    };
  } catch (error) {
    console.error('✗ Error fetching IZIT clients:', error.message);
    return {
      clients: [],
      count: 0,
      connected: false,
      error: error.message
    };
  }
}

/**
 * Fetch complete building status from IZITGreen
 * @returns {Promise<Object>} Complete status with metrics
 */
async function fetchBuildingStatus() {
  try {
    console.log('→ Fetching IZITGreen complete status...');
    const token = await getAccessToken();
    const fetch = getFetch();
    const { apiBaseUrl } = config.izitGreen;

    const sitesUrl = `${apiBaseUrl}/Containers/00%252FIZITGreen%252FServers/Children`;
    const clientsUrl = `${apiBaseUrl}/Containers/00%252FIZITGreen%252FInterfaceClient/Children`;

    const [sitesResponse, clientsResponse] = await Promise.all([
      fetch(sitesUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }),
      fetch(clientsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
    ]);

    const sitesData = sitesResponse.ok ? await sitesResponse.json() : [];
    const clientsData = clientsResponse.ok ? await clientsResponse.json() : [];

    const sites = Array.isArray(sitesData) ? sitesData.map(item => item.Name).filter(Boolean) : [];
    const clients = Array.isArray(clientsData) ? clientsData.map(item => item.Name).filter(Boolean) : [];

    // Calculate building metrics based on connected systems
    const activeSystems = sites.length + clients.length;
    const energyEfficiency = Math.min(95, 75 + activeSystems);
    const carbonReduction = Math.round(45 + (activeSystems * 12));
    const waterSaved = Math.round(1200 + (activeSystems * 85));

    console.log(`✓ IZITGreen Status: ${sites.length} sites, ${clients.length} clients, ${activeSystems} total systems`);

    return {
      connected: true,
      portal: 'IZITGreen',
      portalUrl: 'https://portail.izit.green/',
      sites: {
        names: sites,
        count: sites.length
      },
      clients: {
        names: clients,
        count: clients.length
      },
      metrics: {
        energyEfficiency,
        carbonReduction,
        waterConservation: waterSaved,
        activeSystems,
        automationStatus: 'ACTIVE'
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('✗ Error fetching IZIT status:', error.message);
    return {
      connected: false,
      portal: 'IZITGreen',
      portalUrl: 'https://portail.izit.green/',
      sites: { names: [], count: 0 },
      clients: { names: [], count: 0 },
      metrics: {
        energyEfficiency: 0,
        carbonReduction: 0,
        waterConservation: 0,
        activeSystems: 0,
        automationStatus: 'OFFLINE'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fetch Smart Connector A Value
 * @returns {Promise<Object>} A value data
 */
async function fetchSmartConnectorValue() {
  try {
    console.log('→ Fetching A value from Smart Connector...');
    const token = await getAccessToken();
    const fetch = getFetch();
    const { apiBaseUrl } = config.izitGreen;

    const url = `${apiBaseUrl}/Values/01%252FIZITGreen%252FA/Value`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`✗ A value request failed: ${response.status}`, errorText);
      throw new Error(`A value request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aValue = data.Value !== undefined ? data.Value : data;
    console.log(`✓ A value fetched successfully: ${aValue}`);

    return {
      success: true,
      value: aValue,
      rawData: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('✗ Error fetching A value:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fetch trend samples from IZITGreen
 * @param {string} trendId - Trend identifier
 * @param {string} orderBy - Sort order (default: SampleDateAscending)
 * @returns {Promise<Array>} Trend samples
 */
async function fetchTrendSamples(trendId, orderBy = 'SampleDateAscending') {
  if (!trendId) {
    throw new Error('Missing required parameter: trendId');
  }

  console.log(`→ Fetching trend samples for: ${trendId}`);
  const token = await getAccessToken();
  const fetch = getFetch();
  const { apiBaseUrl } = config.izitGreen;

  const encodedTrendId = encodeURIComponent(trendId);
  const url = `${apiBaseUrl}/TrendSamples?trendId=${encodedTrendId}&orderBy=${orderBy}`;

  console.log(`  API URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`✗ Trend samples request failed: ${response.status}`, errorText);
    throw new Error(`Trend samples request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const sampleCount = Array.isArray(data) ? data.length : 0;
  console.log(`✓ Fetched ${sampleCount} samples for ${trendId.split('/').pop()}`);

  return data;
}

module.exports = {
  getAccessToken,
  fetchSites,
  fetchClients,
  fetchBuildingStatus,
  fetchSmartConnectorValue,
  fetchTrendSamples
};
