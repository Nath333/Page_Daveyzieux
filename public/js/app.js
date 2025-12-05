/**
 * Gestion Énergétique - Daveyzieux Dashboard
 * Main Application JavaScript
 *
 * Features:
 * - Live clock and date display
 * - Store hours management with open/closed status
 * - Weather data integration (Open-Meteo API)
 * - Air quality monitoring
 * - Energy consumption tracking
 * - Temperature sensors visualization
 * - Trane HVAC units monitoring
 * - 24-hour and 7-day forecasts
 * - Automatic section rotation
 *
 * API Endpoints:
 * - Weather: Open-Meteo API
 * - Energy: IZIT API
 */

/* ========================================
   CONFIGURATION & CONSTANTS
   ======================================== */

const weatherCodeMap = {
            0: { description: 'Ciel Dégagé', icon: '☀️' },
            1: { description: 'Principalement Dégagé', icon: '🌤️' },
            2: { description: 'Partiellement Nuageux', icon: '⛅' },
            3: { description: 'Couvert', icon: '☁️' },
            45: { description: 'Brouillard', icon: '🌫️' },
            48: { description: 'Brouillard Givrant', icon: '🌫️' },
            51: { description: 'Bruine Légère', icon: '🌦️' },
            53: { description: 'Bruine', icon: '🌦️' },
            55: { description: 'Bruine Dense', icon: '🌧️' },
            61: { description: 'Pluie Légère', icon: '🌧️' },
            63: { description: 'Pluie', icon: '🌧️' },
            65: { description: 'Pluie Forte', icon: '⛈️' },
            71: { description: 'Neige Légère', icon: '🌨️' },
            73: { description: 'Neige', icon: '❄️' },
            75: { description: 'Neige Forte', icon: '❄️' },
            77: { description: 'Grains de Neige', icon: '🌨️' },
            80: { description: 'Averses de Pluie', icon: '🌦️' },
            81: { description: 'Averses de Pluie', icon: '🌧️' },
            82: { description: 'Averses Fortes', icon: '⛈️' },
            85: { description: 'Averses de Neige', icon: '🌨️' },
            86: { description: 'Neige Forte', icon: '❄️' },
            95: { description: 'Orage', icon: '⛈️' },
            96: { description: 'Tempête de Grêle', icon: '⛈️' },
            99: { description: 'Tempête Forte', icon: '⛈️' }
        };

        function getWeatherInfo(code) {
            return weatherCodeMap[code] || { description: 'Inconnu', icon: '❓' };
        }

        // Rotating Display System
        let currentSection = 1;
        const totalSections = 4;
        const rotationInterval = 5000; // 5 seconds

        function rotateSection() {
            // Hide current section
            const currentEl = document.getElementById(`section-${currentSection}`);
            if (currentEl) {
                currentEl.classList.remove('active');
            }

            // Update current section number (rotate through 1, 2, 3)
            currentSection = (currentSection % totalSections) + 1;

            // Show next section
            const nextEl = document.getElementById(`section-${currentSection}`);
            if (nextEl) {
                nextEl.classList.add('active');
            }

            // Update indicator dots
            const dots = document.querySelectorAll('.rotation-dot');
            dots.forEach((dot, index) => {
                if (index === currentSection - 1) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Start rotation when dashboard is visible
        let rotationTimer = null;

        function startRotation() {
            if (rotationTimer) {
                clearInterval(rotationTimer);
            }
            rotationTimer = setInterval(rotateSection, rotationInterval);
        }

        function stopRotation() {
            if (rotationTimer) {
                clearInterval(rotationTimer);
                rotationTimer = null;
            }
        }

        // Pause rotation on hover and add keyboard navigation
        document.addEventListener('DOMContentLoaded', () => {
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.addEventListener('mouseenter', stopRotation);
                dashboard.addEventListener('mouseleave', startRotation);
            }

            // Keyboard navigation for sections (Arrow keys)
            document.addEventListener('keydown', (e) => {
                // Only handle arrow keys when not in an input field
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    return;
                }

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    stopRotation();
                    rotateSection();
                    setTimeout(startRotation, 3000); // Resume rotation after 3 seconds
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    stopRotation();
                    // Go to previous section
                    const currentEl = document.getElementById(`section-${currentSection}`);
                    if (currentEl) currentEl.classList.remove('active');

                    currentSection = currentSection === 1 ? totalSections : currentSection - 1;

                    const nextEl = document.getElementById(`section-${currentSection}`);
                    if (nextEl) nextEl.classList.add('active');

                    // Update indicator dots
                    const dots = document.querySelectorAll('.rotation-dot');
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === currentSection - 1);
                    });

                    setTimeout(startRotation, 3000); // Resume rotation after 3 seconds
                } else if (e.key === 'r' || e.key === 'R') {
                    // Keyboard shortcut 'R' for refresh
                    e.preventDefault();
                    console.log('🔄 Manual refresh triggered');
                    fetchAllData();
                }
            });

            // Add focus styles for keyboard navigation
            const style = document.createElement('style');
            style.textContent = `
                button:focus-visible,
                a:focus-visible,
                [tabindex]:focus-visible {
                    outline: 3px solid var(--primary);
                    outline-offset: 2px;
                    border-radius: 4px;
                }
            `;
            document.head.appendChild(style);

            // Announce keyboard shortcuts to screen readers
            console.log('⌨️ Keyboard shortcuts available:');
            console.log('   ← → ↑ ↓  Navigate sections');
            console.log('   R        Refresh data');
        });

        function formatTime(timeString) {
            const date = new Date(timeString);
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
            return `${day}, ${monthDay}`;
        }

        function calculateAirQuality(humidity, precipitation) {
            const base = 42;
            const humidityFactor = humidity > 40 && humidity < 70 ? 0.9 : 1.1;
            const rainFactor = precipitation > 0 ? 0.8 : 1.0;
            return Math.round(base * humidityFactor * rainFactor);
        }

        // Fetch and display A value from Smart Connector
        async function refreshAValue() {
            try {
                // Update status to loading
                const statusElement = document.getElementById('aValueStatus');
                const valueElement = document.getElementById('aValue');
                const timestampElement = document.getElementById('aValueTimestamp');

                // Check if elements exist before trying to use them
                if (!statusElement || !valueElement || !timestampElement) {
                    console.log('A value elements not found in DOM, skipping refresh');
                    return;
                }

                statusElement.textContent = 'Chargement...';
                statusElement.style.background = 'rgba(59, 130, 246, 0.1)';
                statusElement.style.color = 'var(--secondary)';

                console.log('Fetching A value from Smart Connector...');

                const response = await fetch('/api/izit/smart-connector/value');
                const data = await response.json();

                if (data.success) {
                    // Update the value display
                    valueElement.textContent = data.value;

                    // Update timestamp
                    const timestamp = new Date(data.timestamp);
                    timestampElement.textContent = timestamp.toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                    });

                    // Update status to success
                    statusElement.textContent = '✅ Valeur chargée avec succès';
                    statusElement.style.background = 'rgba(16, 185, 129, 0.1)';
                    statusElement.style.color = 'var(--primary)';

                    console.log('A value fetched successfully:', data.value);
                } else {
                    throw new Error(data.error || 'Failed to fetch A value');
                }
            } catch (error) {
                console.error('Error fetching A value:', error);

                const statusElement = document.getElementById('aValueStatus');
                const valueElement = document.getElementById('aValue');

                // Check if elements exist before trying to use them
                if (statusElement && valueElement) {
                    valueElement.textContent = 'Erreur';
                    statusElement.textContent = `❌ Erreur: ${error.message}`;
                    statusElement.style.background = 'rgba(239, 68, 68, 0.1)';
                    statusElement.style.color = 'var(--danger)';
                }
            }
        }

        // Update Trane rooftop units based on A value
        // Fetch and update Trane RTU units with real sensor data
        async function updateTraneUnits() {
            console.log('Fetching Trane RTU temperature data...');

            let totalTemp = 0;
            let successCount = 0;

            // Fetch all Trane sensors in parallel
            const dataPromises = traneSensors.map(unit =>
                fetchTempSensorData(unit.path)
                    .then(data => ({ unit, data, success: true }))
                    .catch(error => ({ unit, error, success: false }))
            );

            const results = await Promise.all(dataPromises);

            results.forEach(result => {
                const { unit, data, success } = result;

                if (success && data && data.length > 0) {
                    // Get the most recent temperature value
                    const latestSample = data[data.length - 1];
                    const realTemp = latestSample.Value !== null && latestSample.Value !== undefined
                        ? parseFloat(latestSample.Value)
                        : null;

                    if (realTemp !== null) {
                        const temp = realTemp.toFixed(1);

                        // Update temperature display
                        document.getElementById(`traneTemp${unit.id}`).textContent = temp;

                        // Determine status based on season (month)
                        const currentMonth = new Date().getMonth() + 1; // 1-12
                        const statusElement = document.getElementById(`traneStatus${unit.id}`);

                        // Winter months: November to March (11, 12, 1, 2, 3)
                        // Summer months: May to September (5, 6, 7, 8, 9)
                        if (currentMonth >= 11 || currentMonth <= 3) {
                            // Winter - Heating mode with gas consumption
                            statusElement.textContent = '❄️ Mode Chauffage Actif - Consommation gaz en cours de comptage';
                            statusElement.style.color = 'var(--secondary)';
                        } else if (currentMonth >= 5 && currentMonth <= 9) {
                            // Summer - Cooling mode with electricity consumption
                            statusElement.textContent = '🌡️ Mode Refroidissement Actif - Consommation électrique en cours de comptage';
                            statusElement.style.color = 'var(--warning)';
                        } else {
                            // Spring/Fall - Normal operation
                            statusElement.textContent = '✓ Fonctionnement Normal';
                            statusElement.style.color = 'var(--success)';
                        }

                        totalTemp += realTemp;
                        successCount++;
                        console.log(`✓ ${unit.name}: ${temp}°C`);
                    } else {
                        throw new Error('Invalid temperature value');
                    }
                } else {
                    console.error(`✗ Failed to fetch data for ${unit.name}`);
                    document.getElementById(`traneTemp${unit.id}`).textContent = '--';
                    document.getElementById(`traneStatus${unit.id}`).textContent = 'Erreur de connexion';
                    document.getElementById(`traneStatus${unit.id}`).style.color = 'var(--danger)';
                }
            });

            // Log update status
            if (successCount > 0) {
                console.log(`✓ Trane units updated - ${successCount}/4 units`);
            } else {
                console.error('✗ Failed to fetch any Trane unit data');
            }
        }

        // Update RFTP (Electricity Consumption) data for Trane units
        async function updateRFTPData() {
            console.log('Fetching RFTP (electricity consumption) data...');

            // Fetch all RFTP sensors in parallel
            const dataPromises = rftpSensors.map(sensor =>
                fetchTempSensorData(sensor.path)
                    .then(data => ({ sensor, data, success: true }))
                    .catch(error => ({ sensor, error, success: false }))
            );

            const results = await Promise.all(dataPromises);

            // Variables to store totals
            let totalCurrent = 0;
            let totalAvg = 0;
            let totalMin = 0;
            let totalMax = 0;
            let successfulSensors = 0;

            results.forEach(result => {
                const { sensor, data, success } = result;

                if (success && data && data.length > 0) {
                    // Calculate statistics
                    const values = data.map(sample => parseFloat(sample.Value)).filter(v => !isNaN(v));

                    if (values.length > 0) {
                        const current = parseFloat(values[values.length - 1]);
                        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
                        const min = Math.min(...values);
                        const max = Math.max(...values);

                        // Add to totals
                        totalCurrent += current;
                        totalAvg += avg;
                        totalMin += min;
                        totalMax += max;
                        successfulSensors++;

                        // Update UI
                        document.getElementById(`rftp${sensor.id}Current`).textContent = `${current.toFixed(2)} kW`;
                        document.getElementById(`rftp${sensor.id}Avg`).textContent = `${avg.toFixed(2)} kW`;
                        document.getElementById(`rftp${sensor.id}Min`).textContent = `${min.toFixed(2)} kW`;
                        document.getElementById(`rftp${sensor.id}Max`).textContent = `${max.toFixed(2)} kW`;

                        console.log(`✓ RFTP ${sensor.id}: ${current.toFixed(2)} kW`);
                    }
                } else {
                    console.error(`✗ Failed to fetch RFTP data for sensor ${sensor.id}`);
                    document.getElementById(`rftp${sensor.id}Current`).textContent = '-- kW';
                    document.getElementById(`rftp${sensor.id}Avg`).textContent = '-- kW';
                    document.getElementById(`rftp${sensor.id}Min`).textContent = '-- kW';
                    document.getElementById(`rftp${sensor.id}Max`).textContent = '-- kW';
                }
            });

            // Update total display
            if (successfulSensors > 0) {
                document.getElementById('rftpTotalCurrent').textContent = totalCurrent.toFixed(2);
                document.getElementById('rftpTotalAvg').textContent = totalAvg.toFixed(2);
                document.getElementById('rftpTotalMin').textContent = totalMin.toFixed(2);
                document.getElementById('rftpTotalMax').textContent = totalMax.toFixed(2);

                // Update CVC value in energy panel with the current total
                document.getElementById('energyHvac').textContent = totalCurrent.toFixed(2);

                // Recalculate total energy consumption
                updateTotalEnergy();

                console.log(`✓ Total CVC Consumption: ${totalCurrent.toFixed(2)} kW`);
            } else {
                document.getElementById('rftpTotalCurrent').textContent = '--';
                document.getElementById('rftpTotalAvg').textContent = '--';
                document.getElementById('rftpTotalMin').textContent = '--';
                document.getElementById('rftpTotalMax').textContent = '--';
                document.getElementById('energyHvac').textContent = '--';
            }
        }

        async function fetchAirQuality() {
            try {
                const response = await fetch('/api/air-quality');
                if (!response.ok) throw new Error('Failed to fetch air quality data');

                const data = await response.json();

                // Update AQI display
                document.getElementById('aqiValue').textContent = data.aqi;

                // Update status
                const statusElement = document.getElementById('aqiStatus');
                statusElement.textContent = data.status.status;
                statusElement.style.background = data.status.bg;
                statusElement.style.color = data.status.color;

                // Update components
                document.getElementById('pm25').textContent = data.components.pm25;
                document.getElementById('pm10').textContent = data.components.pm10;
                document.getElementById('no2').textContent = data.components.no2;
                document.getElementById('o3').textContent = data.components.o3;

                console.log('Air quality data updated successfully');

            } catch (error) {
                console.error('Error fetching air quality:', error);
                document.getElementById('aqiStatus').textContent = 'Erreur de chargement';
            }
        }

        async function fetchIZITStatus() {
            try {
                const response = await fetch('/api/izit/status');
                const data = await response.json();

                // Update status badge
                const statusBadges = document.querySelectorAll('.status-dot');
                const connectedColor = data.connected ? 'var(--primary)' : 'var(--danger)';
                statusBadges.forEach(dot => {
                    dot.style.background = connectedColor;
                    dot.style.boxShadow = `0 0 10px ${connectedColor}`;
                });

                document.getElementById('izitStatus').textContent =
                    data.connected ? 'Batiment Connecté' : 'Batiment Hors Ligne';


                // Update automation statuses
                const automationStatuses = document.querySelectorAll('.automation-status span');
                const statusText = data.connected && data.metrics.automationStatus === 'ACTIVE' ? 'ACTIF' : 'HORS LIGNE';
                automationStatuses.forEach(status => {
                    status.textContent = statusText;
                });

            } catch (error) {
                console.error('Error fetching IZIT status:', error);
            }
        }

        // Utility: Show loading state
        function showLoadingState(elementId, message = 'Chargement...') {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.opacity = '0.5';
                element.setAttribute('aria-busy', 'true');
            }
        }

        // Utility: Hide loading state
        function hideLoadingState(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.opacity = '1';
                element.setAttribute('aria-busy', 'false');
            }
        }

        // Utility: Fetch with retry logic
        async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response;
                } catch (error) {
                    console.warn(`Attempt ${i + 1}/${retries} failed for ${url}:`, error.message);
                    if (i === retries - 1) throw error;
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }

        // Cache manager with localStorage
        const CacheManager = {
            set: function(key, data, ttl = 600000) { // Default TTL: 10 minutes
                try {
                    const item = {
                        data: data,
                        timestamp: Date.now(),
                        ttl: ttl
                    };
                    localStorage.setItem(`dashboard_${key}`, JSON.stringify(item));
                } catch (e) {
                    console.warn('Cache set failed:', e);
                }
            },
            get: function(key) {
                try {
                    const itemStr = localStorage.getItem(`dashboard_${key}`);
                    if (!itemStr) return null;

                    const item = JSON.parse(itemStr);
                    const now = Date.now();

                    if (now - item.timestamp > item.ttl) {
                        localStorage.removeItem(`dashboard_${key}`);
                        return null;
                    }

                    return item.data;
                } catch (e) {
                    console.warn('Cache get failed:', e);
                    return null;
                }
            },
            clear: function() {
                try {
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('dashboard_')) {
                            localStorage.removeItem(key);
                        }
                    });
                } catch (e) {
                    console.warn('Cache clear failed:', e);
                }
            }
        };

        // Separate display update function for reuse with cache
        function updateWeatherDisplay(data) {
            if (!data || !data.current) return;

            try {
                // Update current weather
                const currentWeatherInfo = getWeatherInfo(data.current.weather_code);
                document.getElementById('weatherIcon').textContent = currentWeatherInfo.icon;
                document.getElementById('temperature').textContent = `${Math.round(data.current.temperature)}°`;
                document.getElementById('weatherDesc').textContent = currentWeatherInfo.description.toUpperCase();
                document.getElementById('feelsLike').textContent = Math.round(data.current.feels_like);
                document.getElementById('humidity').textContent = data.current.humidity;
                document.getElementById('windSpeed').textContent = Math.round(data.current.wind_speed);
                document.getElementById('pressure').textContent = Math.round(data.current.pressure);
                document.getElementById('uvIndex').textContent = Math.round(data.current.uv_index || 0);
                document.getElementById('cloudCover').textContent = data.current.cloud_cover;

                // Update energy consumption (CVC and Éclairage have fixed values, Gas can be dynamic)
                if (data.energy && data.energy.current) {
                    // CVC (85 kWh/h) and Éclairage (21.8 kWh/h) are now static values
                    // Gas consumption can be added from API if available
                    if (data.energy.current.gas) {
                        document.getElementById('energyGas').textContent = data.energy.current.gas;
                    }
                }

                // Update hourly forecast (every 1.5 hours)
                const hourlyContainer = document.getElementById('hourlyForecast');
                hourlyContainer.innerHTML = '';
                for (let hour = 0; hour < 24; hour += 2) {
                    const i = hour;
                    if (i >= 24) break;
                    const weatherInfo = getWeatherInfo(data.hourly.weather_codes[i]);
                    const energyData = data.energy.forecast_24h[i];

                    const hourlyCard = document.createElement('div');
                    hourlyCard.className = 'hourly-card';
                    hourlyCard.innerHTML = `
                        <div class="hourly-time">${formatTime(data.hourly.time[i])}</div>
                        <div class="hourly-icon">${weatherInfo.icon}</div>
                        <div class="hourly-temp">${Math.round(data.hourly.temperature[i])}°C</div>
                        <div class="hourly-details">
                            <div class="hourly-detail">💧 ${data.hourly.precipitation_probability[i] || 0}%</div>
                            <div class="hourly-detail">☁️ ${data.hourly.cloud_cover[i]}%</div>
                            <div class="hourly-detail">💨 ${Math.round(data.hourly.wind_speed[i])} km/h</div>
                            <div class="hourly-energy">⚡ ${energyData.consumption.total} kWh</div>
                        </div>
                    `;
                    hourlyContainer.appendChild(hourlyCard);
                }

                // Update daily forecast
                const dailyContainer = document.getElementById('dailyForecast');
                dailyContainer.innerHTML = '';
                for (let i = 0; i < data.daily.time.length; i++) {
                    const weatherInfo = getWeatherInfo(data.daily.weather_codes[i]);
                    const dailyCard = document.createElement('div');
                    dailyCard.className = 'daily-card';
                    dailyCard.innerHTML = `
                        <div class="daily-day">${formatDate(data.daily.time[i])}</div>
                        <div class="daily-icon">${weatherInfo.icon}</div>
                        <div class="daily-temps">
                            <div class="temp-range">
                                <span class="temp-high">${Math.round(data.daily.temperature_max[i])}°</span>
                                <span style="color: var(--text-secondary);">/</span>
                                <span class="temp-low">${Math.round(data.daily.temperature_min[i])}°</span>
                            </div>
                            <div class="hourly-detail">💧 ${data.daily.precipitation_sum[i]} mm</div>
                        </div>
                        <div class="daily-stats">
                            <div class="daily-detail">
                                <div class="detail-label">Wind</div>
                                <div class="detail-value">${Math.round(data.daily.wind_speed_max[i])} km/h</div>
                            </div>
                            <div class="daily-detail">
                                <div class="detail-label">UV Index</div>
                                <div class="detail-value">${Math.round(data.daily.uv_index_max[i] || 0)}</div>
                            </div>
                        </div>
                        <div class="daily-detail">
                            <div class="detail-label">Daylight</div>
                            <div class="detail-value">${Math.round(data.daily.daylight_duration[i] / 3600)}h</div>
                        </div>
                    `;
                    dailyContainer.appendChild(dailyCard);
                }

                // Update last sync time
            } catch (error) {
                console.error('Error updating weather display:', error);
            }
        }

        // Main data fetching function with improved error handling
        async function fetchAllData() {
            try {
                showLoadingState('temperature');
                showLoadingState('weatherDesc');

                // Try to load from cache first for instant display
                const cachedData = CacheManager.get('weather');
                if (cachedData) {
                    console.log('✓ Loading from cache...');
                    updateWeatherDisplay(cachedData);
                }

                // Fetch fresh data with retry logic
                const response = await fetchWithRetry('/api/weather', {}, 3, 1000);
                const data = await response.json();

                // Cache the fresh data
                CacheManager.set('weather', data, 600000); // 10 min TTL

                // Update display with fresh data
                updateWeatherDisplay(data);

                hideLoadingState('temperature');
                hideLoadingState('weatherDesc');

                // Fetch air quality and IZIT status in parallel
                await Promise.all([
                    fetchAirQuality().catch(e => console.error('Air quality fetch failed:', e)),
                    fetchIZITStatus().catch(e => console.error('IZIT status fetch failed:', e))
                ]);

                // Update last refresh time
                document.getElementById('lastUpdate').textContent = new Date().toLocaleString('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });

                // Show dashboard
                const loadingEl = document.getElementById('loading');
                const dashboardEl = document.getElementById('dashboard');
                if (loadingEl) loadingEl.style.display = 'none';
                if (dashboardEl) dashboardEl.style.display = 'block';

                // Start section rotation
                startRotation();

            } catch (error) {
                console.error('❌ Erreur:', error);
                const loadingText = document.querySelector('.loading-text');
                if (loadingText) {
                    loadingText.textContent = 'Erreur de chargement. Nouvelle tentative dans 5s...';
                }
                // Retry after 5 seconds
                setTimeout(fetchAllData, 5000);
            }
        }

        // Update live clock
        function updateClock() {
            const now = new Date();

            // Format time (24-hour format)
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            // Format date
            const dateString = now.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            document.getElementById('liveTime').textContent = timeString;
            document.getElementById('liveDate').textContent = dateString;
        }

        // Store Hours Management
        function updateStoreHours() {
            const now = new Date();
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;

            // Store hours definition
            const storeHours = {
                0: { name: 'Dimanche', hours: 'Fermé', open: false, periods: [] }, // Sunday
                1: { name: 'Lundi', hours: '09:00-12:00, 14:00-19:00', open: true, periods: [[540, 720], [840, 1140]] }, // Monday
                2: { name: 'Mardi', hours: '09:00-12:00, 14:00-19:00', open: true, periods: [[540, 720], [840, 1140]] }, // Tuesday
                3: { name: 'Mercredi', hours: '09:00-12:00, 14:00-19:00', open: true, periods: [[540, 720], [840, 1140]] }, // Wednesday
                4: { name: 'Jeudi', hours: '09:00-12:00, 14:00-19:00', open: true, periods: [[540, 720], [840, 1140]] }, // Thursday
                5: { name: 'Vendredi', hours: '09:00-12:00, 14:00-19:00', open: true, periods: [[540, 720], [840, 1140]] }, // Friday
                6: { name: 'Samedi', hours: '09:00-19:00', open: true, periods: [[540, 1140]] } // Saturday
            };

            const todayInfo = storeHours[currentDay];

            // Update current day display
            document.getElementById('currentDayName').textContent = todayInfo.name;
            document.getElementById('currentDayHours').textContent = todayInfo.hours;

            // Check if store is currently open
            let isCurrentlyOpen = false;
            if (todayInfo.open) {
                for (const period of todayInfo.periods) {
                    if (currentTimeInMinutes >= period[0] && currentTimeInMinutes <= period[1]) {
                        isCurrentlyOpen = true;
                        break;
                    }
                }
            }

            // Update status badge
            const statusElement = document.getElementById('storeStatus');
            if (isCurrentlyOpen) {
                statusElement.textContent = '🟢 Ouvert Maintenant';
                statusElement.style.background = 'rgba(16, 185, 129, 0.2)';
                statusElement.style.color = 'var(--primary)';
                statusElement.style.border = '1px solid var(--primary)';

                // Calculate closing time
                let closingTime = '';
                for (const period of todayInfo.periods) {
                    if (currentTimeInMinutes >= period[0] && currentTimeInMinutes <= period[1]) {
                        const closingHour = Math.floor(period[1] / 60);
                        const closingMinute = period[1] % 60;
                        closingTime = `${String(closingHour).padStart(2, '0')}:${String(closingMinute).padStart(2, '0')}`;
                        break;
                    }
                }
                if (closingTime) {
                    statusElement.textContent += ` • Ferme à ${closingTime}`;
                }
            } else {
                statusElement.textContent = '🔴 Fermé';
                statusElement.style.background = 'rgba(239, 68, 68, 0.2)';
                statusElement.style.color = 'var(--danger)';
                statusElement.style.border = '1px solid var(--danger)';

                // Find next opening time
                let nextOpenDay = (currentDay + 1) % 7;
                let daysUntilOpen = 1;
                while (!storeHours[nextOpenDay].open || storeHours[nextOpenDay].periods.length === 0) {
                    nextOpenDay = (nextOpenDay + 1) % 7;
                    daysUntilOpen++;
                    if (daysUntilOpen > 7) break; // Safety check
                }

                if (todayInfo.open && todayInfo.periods.length > 0) {
                    // Check if there's a period later today
                    for (const period of todayInfo.periods) {
                        if (currentTimeInMinutes < period[0]) {
                            const openingHour = Math.floor(period[0] / 60);
                            const openingMinute = period[0] % 60;
                            const openingTime = `${String(openingHour).padStart(2, '0')}:${String(openingMinute).padStart(2, '0')}`;
                            statusElement.textContent += ` • Ouvre à ${openingTime}`;
                            break;
                        }
                    }
                } else if (daysUntilOpen <= 7) {
                    const nextDay = storeHours[nextOpenDay];
                    const openingHour = Math.floor(nextDay.periods[0][0] / 60);
                    const openingMinute = nextDay.periods[0][0] % 60;
                    const openingTime = `${String(openingHour).padStart(2, '0')}:${String(openingMinute).padStart(2, '0')}`;
                    statusElement.textContent += ` • Ouvre ${nextDay.name} à ${openingTime}`;
                }
            }

            // Highlight current day in the weekly schedule
            const dayIds = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            dayIds.forEach((dayId, index) => {
                const element = document.getElementById(`hours-${dayId}`);
                if (element) {
                    if (index === currentDay) {
                        element.style.background = 'rgba(16, 185, 129, 0.15)';
                        element.style.borderLeft = '3px solid var(--primary)';
                        element.style.paddingLeft = '9px';
                    } else {
                        element.style.background = 'rgba(255, 255, 255, 0.02)';
                        element.style.borderLeft = 'none';
                        element.style.paddingLeft = '12px';
                    }
                }
            });
        }

        // Temperature Sensors Configuration
        const tempSensors = [
            {
                id: 'TempSensor7',
                name: 'Température Extérieure',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/TempSensor7.temperature-interval extended trend log',
                color: 'rgba(168, 85, 247, 1)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)'
            },
            {
                id: 'TempSensor2',
                name: 'Sonde Rooftop Surface de Vente 1',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/TempSensor2.temperature-interval extended trend log',
                color: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
            },
            {
                id: 'TempSensor3',
                name: 'Sonde Rooftop Surface de Vente 2',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/TempSensor3.temperature-interval extended trend log',
                color: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
            },
            {
                id: 'TempSensor5',
                name: 'Sonde Rooftop Surface de Vente 3',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/TempSensor5.temperature-interval extended trend log',
                color: 'rgba(236, 72, 153, 1)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)'
            }
        ];

        // Pressure and RFTP Sensors Configuration
        const pressureRftpSensors = [
            {
                id: 'PSensor1',
                name: 'P Sensor 1',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/P-interval extended trend log',
                color: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
            },
            {
                id: 'PSensor2',
                name: 'P Sensor 2',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/P-interval extended trend log_2',
                color: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            },
            {
                id: 'PSensor3',
                name: 'P Sensor 3',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/P-interval extended trend log_3',
                color: 'rgba(245, 158, 11, 1)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)'
            },
            {
                id: 'PSensor4',
                name: 'P Sensor 4',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/P-interval extended trend log_4',
                color: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
            },
            {
                id: 'PSensor5',
                name: 'P Sensor 5',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/P-interval extended trend log_5',
                color: 'rgba(168, 85, 247, 1)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)'
            },
            {
                id: 'PSensor6',
                name: 'P Sensor 6',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/a/P-interval extended trend log_6',
                color: 'rgba(236, 72, 153, 1)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)'
            },
            {
                id: 'RFTPSensor1',
                name: 'RFTP Sensor 1',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp1',
                color: 'rgba(20, 184, 166, 1)',
                backgroundColor: 'rgba(20, 184, 166, 0.1)'
            },
            {
                id: 'RFTPSensor2',
                name: 'RFTP Sensor 2',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp2',
                color: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            },
            {
                id: 'RFTPSensor3',
                name: 'RFTP Sensor 3',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp3',
                color: 'rgba(244, 63, 94, 1)',
                backgroundColor: 'rgba(244, 63, 94, 0.1)'
            },
            {
                id: 'RFTPSensor4',
                name: 'RFTP Sensor 4',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp4',
                color: 'rgba(251, 146, 60, 1)',
                backgroundColor: 'rgba(251, 146, 60, 0.1)'
            }
        ];

        // Gas Sensor Configuration (standalone - no graph)
        const gasSensor = {
            id: 'GazSensor',
            name: 'Gaz',
            path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_gaz',
            unit: 'm³/h'
        };

        // Trane RTU Temperature Sensors Configuration
        const traneSensors = [
            {
                id: 1,
                name: 'Trane RTU-01 (Nord)',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_temp 1',
                tempOffset: -0.8,
                flowOffset: 50,
                powerOffset: 0.2
            },
            {
                id: 2,
                name: 'Trane RTU-02 (Sud)',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_temp 2',
                tempOffset: 2.2,
                flowOffset: 150,
                powerOffset: 0.6
            },
            {
                id: 3,
                name: 'Trane RTU-03 (Est)',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_temp 3',
                tempOffset: 1.0,
                flowOffset: 100,
                powerOffset: 0.4
            },
            {
                id: 4,
                name: 'Trane RTU-04 (Ouest)',
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_temp 4',
                tempOffset: 0.5,
                flowOffset: 75,
                powerOffset: 0.3
            }
        ];

        // RFTP Sensors for Trane Units (Electricity Consumption)
        const rftpSensors = [
            {
                id: 1,
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp1'
            },
            {
                id: 2,
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp2'
            },
            {
                id: 3,
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp3'
            },
            {
                id: 4,
                path: '01/IZITGreen/InterfaceClient/MrBricolage Daveysieux/extended trend log/Extended Trend Log_rftp4'
            }
        ];

        let tempSensorCharts = {};
        let pressureRftpCharts = {};

        // Fetch temperature sensor trend data
        async function fetchTempSensorData(sensorPath) {
            try {
                // URL encode the trend ID (matches the pattern from trendApi.js)
                const encodedPath = encodeURIComponent(sensorPath);

                // Use the same endpoint structure as the refactored API
                // This should proxy to: GET /TrendSamples?trendId={encodedPath}&orderBy=SampleDateAscending
                const response = await fetch(`/api/izit/trend-samples?trendId=${encodedPath}&orderBy=SampleDateAscending`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // The API returns an array of samples with SampleDate, Value, Quality
                // Example: [{ SampleDate: "2024-01-15T10:30:00Z", Value: 22.5, Quality: "Good" }]
                console.log(`Fetched ${data.length} samples for ${sensorPath.split('/').pop()}`);

                return data;
            } catch (error) {
                console.error(`Error fetching data for ${sensorPath}:`, error);
                throw error;
            }
        }

        // Create a chart for a temperature sensor
        function createTempSensorChart(sensor, data) {
            const canvas = document.getElementById(`chart-${sensor.id}`);
            if (!canvas) {
                console.error(`Canvas not found for ${sensor.id}`);
                return null;
            }

            const ctx = canvas.getContext('2d');

            // Destroy existing chart if it exists
            if (tempSensorCharts[sensor.id]) {
                tempSensorCharts[sensor.id].destroy();
            }

            // Process data
            const labels = data.map(sample => {
                const date = new Date(sample.SampleDate);
                return date.toLocaleString('fr-FR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            });

            // Convert values to numbers
            const values = data.map(sample => {
                const val = sample.Value;
                return (val !== null && val !== undefined) ? parseFloat(val) : null;
            });

            // Calculate statistics - ensure all values are numbers
            const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v)).map(v => Number(v));
            const min = validValues.length > 0 ? Math.min(...validValues).toFixed(1) : 'N/A';
            const max = validValues.length > 0 ? Math.max(...validValues).toFixed(1) : 'N/A';
            const avg = validValues.length > 0 ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1) : 'N/A';
            const current = validValues.length > 0 ? Number(validValues[validValues.length - 1]).toFixed(1) : 'N/A';

            // Update stats display
            document.getElementById(`stats-${sensor.id}-min`).textContent = min;
            document.getElementById(`stats-${sensor.id}-max`).textContent = max;
            document.getElementById(`stats-${sensor.id}-avg`).textContent = avg;
            document.getElementById(`stats-${sensor.id}-current`).textContent = current;
            document.getElementById(`stats-${sensor.id}-count`).textContent = validValues.length;

            // Create chart
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: sensor.name,
                        data: values,
                        borderColor: sensor.color,
                        backgroundColor: sensor.backgroundColor,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: sensor.color,
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(37, 45, 61, 0.95)',
                            titleColor: '#f8fafc',
                            bodyColor: '#f8fafc',
                            borderColor: sensor.color,
                            borderWidth: 1,
                            padding: 12,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    return `${sensor.name}: ${context.parsed.y !== null ? context.parsed.y.toFixed(1) + '°C' : 'N/A'}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                color: 'rgba(61, 71, 88, 0.3)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a8b3cf',
                                maxRotation: 45,
                                minRotation: 45,
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                color: 'rgba(61, 71, 88, 0.3)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a8b3cf',
                                callback: function(value) {
                                    return value + '°C';
                                }
                            },
                            beginAtZero: false
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

            return chart;
        }

        // Refresh all temperature sensors - Combined Chart Version
        async function refreshTempSensors() {
            const statusElement = document.getElementById('tempSensorsStatus');
            const statsContainer = document.getElementById('tempSensorsStats');

            try {
                statusElement.textContent = 'Chargement des données...';
                statusElement.style.background = 'rgba(59, 130, 246, 0.1)';
                statusElement.style.color = 'var(--secondary)';

                // Clear existing stats
                statsContainer.innerHTML = '';

                // Fetch all sensor data in parallel
                const dataPromises = tempSensors.map(sensor =>
                    fetchTempSensorData(sensor.path)
                        .then(data => ({ sensor, data, success: true }))
                        .catch(error => ({ sensor, error, success: false }))
                );

                const results = await Promise.all(dataPromises);

                // Count successful fetches first
                let successCount = 0;
                let totalPoints = 0;
                results.forEach(result => {
                    if (result.success && result.data && result.data.length > 0) {
                        successCount++;
                        totalPoints += result.data.length;
                    }
                });

                // Update status immediately
                if (successCount > 0) {
                    statusElement.textContent = `✅ ${successCount} capteur(s) chargé(s) avec succès (${totalPoints} points de données au total)`;
                    statusElement.style.background = 'rgba(16, 185, 129, 0.1)';
                    statusElement.style.color = 'var(--primary)';
                } else {
                    statusElement.textContent = '❌ Erreur: Aucune donnée n\'a pu être chargée';
                    statusElement.style.background = 'rgba(239, 68, 68, 0.1)';
                    statusElement.style.color = 'var(--danger)';
                }

                // Create stats cards for each sensor
                results.forEach(result => {
                    const { sensor, data, success } = result;

                    const statCard = document.createElement('div');
                    statCard.style.cssText = 'background: rgba(255, 255, 255, 0.02); border-radius: 6px; padding: 8px; border: 1px solid var(--border);';

                    if (success && data && data.length > 0) {
                        const values = data.map(sample => {
                            const val = sample.Value;
                            return (val !== null && val !== undefined) ? parseFloat(val) : null;
                        }).filter(v => v !== null && !isNaN(v)).map(v => Number(v));

                        const min = values.length > 0 ? Math.min(...values).toFixed(1) : 'N/A';
                        const max = values.length > 0 ? Math.max(...values).toFixed(1) : 'N/A';
                        const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'N/A';
                        const current = values.length > 0 ? Number(values[values.length - 1]).toFixed(1) : 'N/A';

                        statCard.innerHTML = `
                            <div style="font-size: 0.75em; font-weight: 700; color: ${sensor.color}; margin-bottom: 6px;">${sensor.name}</div>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 0.7em;">
                                <div>
                                    <div style="color: var(--text-secondary);">Actuel</div>
                                    <div style="font-weight: 700; color: var(--text-primary);">${current}°C</div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Moyenne</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${avg}°C</div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Min</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${min}°C</div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Max</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${max}°C</div>
                                </div>
                            </div>
                        `;
                    } else {
                        statCard.innerHTML = `
                            <div style="font-size: 0.75em; font-weight: 700; color: ${sensor.color}; margin-bottom: 6px;">${sensor.name}</div>
                            <div style="color: var(--danger); font-size: 0.7em;">Erreur de chargement</div>
                        `;
                    }

                    statsContainer.appendChild(statCard);
                });

                // Create combined chart
                setTimeout(() => {
                    createCombinedTempChart(results);
                }, 100);

            } catch (error) {
                console.error('Error refreshing temperature sensors:', error);
                statusElement.textContent = `❌ Erreur: ${error.message}`;
                statusElement.style.background = 'rgba(239, 68, 68, 0.1)';
                statusElement.style.color = 'var(--danger)';
            }
        }

        // Create combined chart with all sensors
        function createCombinedTempChart(results) {
            const canvas = document.getElementById('combinedTempChart');
            if (!canvas) {
                console.error('Combined chart canvas not found');
                return;
            }

            const ctx = canvas.getContext('2d');

            // Destroy existing chart if it exists
            if (tempSensorCharts['combined']) {
                tempSensorCharts['combined'].destroy();
            }

            // Prepare datasets for all sensors
            const datasets = [];
            let allLabels = [];

            results.forEach(result => {
                if (result.success && result.data && result.data.length > 0) {
                    const { sensor, data } = result;

                    // Get labels from the first sensor with data
                    if (allLabels.length === 0) {
                        allLabels = data.map(sample => {
                            const date = new Date(sample.SampleDate);
                            return date.toLocaleString('fr-FR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        });
                    }

                    const values = data.map(sample => {
                        const val = sample.Value;
                        return (val !== null && val !== undefined) ? parseFloat(val) : null;
                    });

                    datasets.push({
                        label: sensor.name,
                        data: values,
                        borderColor: sensor.color,
                        backgroundColor: sensor.backgroundColor,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: sensor.color,
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    });
                }
            });

            // Create chart
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: allLabels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#f8fafc',
                                font: {
                                    size: 12,
                                    weight: '600'
                                },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'line'
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(37, 45, 61, 0.95)',
                            titleColor: '#f8fafc',
                            bodyColor: '#f8fafc',
                            borderColor: 'rgba(16, 185, 129, 0.5)',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y !== null ? context.parsed.y.toFixed(1) + '°C' : 'N/A'}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                color: 'rgba(61, 71, 88, 0.3)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a8b3cf',
                                maxRotation: 45,
                                minRotation: 45,
                                maxTicksLimit: 12
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                color: 'rgba(61, 71, 88, 0.3)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a8b3cf',
                                callback: function(value) {
                                    return value + '°C';
                                }
                            },
                            beginAtZero: false
                        }
                    },
                    interaction: {
                        mode: 'index',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

            tempSensorCharts['combined'] = chart;
        }

        // Refresh all pressure/rftp sensors - Combined Chart Version
        async function refreshPressureRftpSensors() {
            const statusElement = document.getElementById('pressureRftpStatus');
            const statsContainer = document.getElementById('pressureRftpStats');

            // Check if elements exist before trying to use them
            if (!statusElement || !statsContainer) {
                console.log('Pressure/RFTP elements not found in DOM, skipping refresh');
                return;
            }

            try {
                statusElement.textContent = 'Chargement des données...';
                statusElement.style.background = 'rgba(59, 130, 246, 0.1)';
                statusElement.style.color = 'var(--secondary)';

                // Clear existing stats
                statsContainer.innerHTML = '';

                // Fetch all sensor data in parallel
                const dataPromises = pressureRftpSensors.map(sensor =>
                    fetchTempSensorData(sensor.path) // Reusing the same fetch function
                        .then(data => ({ sensor, data, success: true }))
                        .catch(error => ({ sensor, error, success: false }))
                );

                const results = await Promise.all(dataPromises);

                // Count successful fetches first
                let successCount = 0;
                let totalPoints = 0;
                results.forEach(result => {
                    if (result.success && result.data && result.data.length > 0) {
                        successCount++;
                        totalPoints += result.data.length;
                    }
                });

                // Update status immediately
                if (successCount > 0) {
                    statusElement.textContent = `✅ ${successCount} capteur(s) chargé(s) avec succès (${totalPoints} points de données au total)`;
                    statusElement.style.background = 'rgba(16, 185, 129, 0.1)';
                    statusElement.style.color = 'var(--primary)';
                } else {
                    statusElement.textContent = '❌ Erreur: Aucune donnée n\'a pu être chargée';
                    statusElement.style.background = 'rgba(239, 68, 68, 0.1)';
                    statusElement.style.color = 'var(--danger)';
                }

                // Create stats cards for each sensor
                results.forEach(result => {
                    const { sensor, data, success } = result;

                    const statCard = document.createElement('div');
                    statCard.style.cssText = 'background: rgba(255, 255, 255, 0.02); border-radius: 8px; padding: 12px; border: 1px solid var(--border);';

                    if (success && data && data.length > 0) {
                        const values = data.map(sample => {
                            const val = sample.Value;
                            return (val !== null && val !== undefined) ? parseFloat(val) : null;
                        }).filter(v => v !== null && !isNaN(v)).map(v => Number(v));

                        const min = values.length > 0 ? Math.min(...values).toFixed(2) : 'N/A';
                        const max = values.length > 0 ? Math.max(...values).toFixed(2) : 'N/A';
                        const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A';
                        const current = values.length > 0 ? Number(values[values.length - 1]).toFixed(2) : 'N/A';

                        statCard.innerHTML = `
                            <div style="font-size: 0.9em; font-weight: 700; color: ${sensor.color}; margin-bottom: 8px;">${sensor.name}</div>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.8em;">
                                <div>
                                    <div style="color: var(--text-secondary);">Actuel</div>
                                    <div style="font-weight: 700; color: var(--text-primary);">${current}</div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Moyenne</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${avg}</div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Min</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${min}</div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Max</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${max}</div>
                                </div>
                            </div>
                        `;
                    } else {
                        statCard.innerHTML = `
                            <div style="font-size: 0.9em; font-weight: 700; color: ${sensor.color}; margin-bottom: 8px;">${sensor.name}</div>
                            <div style="color: var(--danger); font-size: 0.85em;">Erreur de chargement</div>
                        `;
                    }

                    statsContainer.appendChild(statCard);
                });

                // Create combined chart
                setTimeout(() => {
                    createCombinedPressureRftpChart(results);
                }, 100);

            } catch (error) {
                console.error('Error refreshing pressure/rftp sensors:', error);
                statusElement.textContent = `❌ Erreur: ${error.message}`;
                statusElement.style.background = 'rgba(239, 68, 68, 0.1)';
                statusElement.style.color = 'var(--danger)';
            }
        }

        // Create combined chart with all pressure/rftp sensors
        function createCombinedPressureRftpChart(results) {
            const canvas = document.getElementById('combinedPressureRftpChart');
            if (!canvas) {
                console.error('Combined pressure/rftp chart canvas not found');
                return;
            }

            const ctx = canvas.getContext('2d');

            // Destroy existing chart if it exists
            if (pressureRftpCharts['combined']) {
                pressureRftpCharts['combined'].destroy();
            }

            // Prepare datasets for all sensors
            const datasets = [];
            let allLabels = [];

            results.forEach(result => {
                if (result.success && result.data && result.data.length > 0) {
                    const { sensor, data } = result;

                    // Get labels from the first sensor with data
                    if (allLabels.length === 0) {
                        allLabels = data.map(sample => {
                            const date = new Date(sample.SampleDate);
                            return date.toLocaleString('fr-FR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        });
                    }

                    const values = data.map(sample => {
                        const val = sample.Value;
                        return (val !== null && val !== undefined) ? parseFloat(val) : null;
                    });

                    datasets.push({
                        label: sensor.name,
                        data: values,
                        borderColor: sensor.color,
                        backgroundColor: sensor.backgroundColor,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: sensor.color,
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    });
                }
            });

            // Check if we have any data to display
            if (datasets.length === 0 || allLabels.length === 0) {
                console.warn('No data available to create pressure/rftp chart');
                return;
            }

            // Create chart
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: allLabels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#f8fafc',
                                font: {
                                    size: 12,
                                    weight: '600'
                                },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'line'
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(37, 45, 61, 0.95)',
                            titleColor: '#f8fafc',
                            bodyColor: '#f8fafc',
                            borderColor: 'rgba(16, 185, 129, 0.5)',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y !== null ? context.parsed.y.toFixed(2) : 'N/A'}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                color: 'rgba(61, 71, 88, 0.3)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a8b3cf',
                                maxRotation: 45,
                                minRotation: 45,
                                maxTicksLimit: 12
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                color: 'rgba(61, 71, 88, 0.3)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a8b3cf',
                                callback: function(value) {
                                    return value.toFixed(2);
                                }
                            },
                            beginAtZero: false
                        }
                    },
                    interaction: {
                        mode: 'index',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

            pressureRftpCharts['combined'] = chart;
        }

        // Fetch and display gas sensor value
        async function refreshGasValue() {
            const energyGasElement = document.getElementById('energyGas');

            try {
                console.log('Fetching gas sensor value...');

                // Fetch the gas sensor data
                const data = await fetchTempSensorData(gasSensor.path);

                if (data && data.length > 0) {
                    // Get the most recent value
                    const latestSample = data[data.length - 1];
                    const value = latestSample.Value !== null && latestSample.Value !== undefined
                        ? parseFloat(latestSample.Value).toFixed(2)
                        : '--';

                    // Update the energy panel display
                    energyGasElement.textContent = value;

                    console.log(`✓ Gas sensor value: ${value} ${gasSensor.unit}`);
                } else {
                    throw new Error('No data available');
                }
            } catch (error) {
                console.error('Error fetching gas sensor value:', error);
                energyGasElement.textContent = '--';
            }
        }

        // Calculate and update total energy consumption
        function updateTotalEnergy() {
            const hvacValue = parseFloat(document.getElementById('energyHvac').textContent) || 0;
            const lightingValue = parseFloat(document.getElementById('energyLighting').textContent) || 0;

            // Note: Gas is in m³/h, not kWh/h, so we don't include it in the electricity total
            const total = hvacValue + lightingValue;

            document.getElementById('energyTotal').textContent = total.toFixed(2);
            console.log(`✓ Total Energy: ${total.toFixed(2)} kWh/h (CVC: ${hvacValue} + Éclairage: ${lightingValue})`);
        }

        // Consolidated refresh function to avoid multiple redundant setInterval calls
        function refreshAll20Minutes() {
            fetchAllData();
            refreshAValue();
            updateTraneUnits();
            updateRFTPData();
            refreshTempSensors();
            refreshPressureRftpSensors();
            updateTotalEnergy();
        }

        // Initialize clock and store hours
        updateClock();
        setInterval(updateClock, 1000); // Update clock every second
        updateStoreHours();
        setInterval(updateStoreHours, 60000); // Update store hours every minute

        // Initial data load - staggered to prevent overload
        fetchAllData();
        setTimeout(() => refreshAValue(), 200);
        setTimeout(() => {
            updateTraneUnits();
            updateRFTPData();
        }, 1500);
        setTimeout(() => refreshTempSensors(), 2000);
        setTimeout(() => refreshPressureRftpSensors(), 3000);
        setTimeout(() => updateTotalEnergy(), 500);

        // Consolidated 20-minute refresh cycle (reduces timer overhead)
        setInterval(refreshAll20Minutes, 1200000); // Auto-refresh every 20 minutes

        // Gas sensor refreshes every 2 hours (separate cycle)
        setTimeout(() => refreshGasValue(), 2500);
        setInterval(refreshGasValue, 7200000); // Auto-refresh every 2 hours
