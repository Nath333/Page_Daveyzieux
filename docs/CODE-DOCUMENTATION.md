# Brico Dave HTML - Complete Code Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Code](#backend-code)
4. [Frontend Code](#frontend-code)
5. [Docker Configuration](#docker-configuration)
6. [Nginx Configuration](#nginx-configuration)
7. [Deployment Scripts](#deployment-scripts)
8. [Environment Variables](#environment-variables)
9. [API Reference](#api-reference)
10. [Key Features](#key-features)

---

## Project Overview

**Brico Dave HTML** is a professional building analytics dashboard application designed for monitoring environmental and energy data. It integrates with the IZITGreen building automation system to provide real-time monitoring of:

- Weather conditions and forecasts
- Air quality metrics
- Temperature sensors and trends
- Energy consumption analysis
- Building automation status

### Technology Stack
- **Backend**: Node.js with Express.js
- **Frontend**: Pure HTML/CSS/JavaScript with Chart.js
- **Deployment**: Docker + Docker Compose + Nginx
- **SSL**: Let's Encrypt (domain-based) or Self-signed (IP-based)
- **External APIs**:
  - IZITGreen Portal API
  - Open-Meteo Weather API
  - Open-Meteo Air Quality API

---

## Architecture

### System Architecture

```
┌─────────────────┐
│   Browser       │
│   (Client)      │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Nginx         │  ← Reverse Proxy, SSL Termination
│   (Port 443)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Node.js       │  ← Express Server
│   (Port 3001)   │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│   IZITGreen     │  │   Open-Meteo     │
│   Portal API    │  │   APIs           │
│   (External)    │  │   (External)     │
└─────────────────┘  └──────────────────┘
```

### File Structure

```
brico-dave-html/
├── server.js                    # Backend Express server
├── index.html                   # Frontend dashboard
├── package.json                 # Node.js dependencies
├── Dockerfile                   # Container build instructions
├── docker-compose.yml           # Basic development setup
├── docker-compose.prod.yml      # Production with nginx + SSL
├── docker-compose.ip.yml        # IP-based deployment
├── deploy-ubuntu.sh             # Ubuntu deployment (domain-based)
├── deploy-ip.sh                 # IP-based deployment script
├── nginx/
│   ├── nginx.conf               # Main nginx configuration
│   └── conf.d/
│       ├── default.conf         # Let's Encrypt SSL config
│       ├── ip-ssl.conf          # Self-signed SSL config
│       └── http-only.conf.example # HTTP-only config
└── Logo-Brico-Marche.png        # Branding assets
```

---

## Backend Code

### server.js - Express Server

The backend is a Node.js Express server that provides API endpoints for weather, air quality, and IZITGreen building data.

#### 1. Server Initialization

```javascript
const express = require('express');
const app = express();
```

**Purpose**: Creates an Express application instance.

#### 2. Proxy Configuration

```javascript
app.set('trust proxy', true);
```

**Purpose**: Enables trust for reverse proxy headers (Cloudflare Tunnel, nginx). This is critical for:
- Getting correct client IP addresses
- Handling HTTPS termination at the proxy level
- Working with Cloudflare Tunnel

#### 3. Cloudflare Middleware

```javascript
app.use((req, res, next) => {
  const cfVisitor = req.headers['cf-visitor'];
  const xForwardedProto = req.headers['x-forwarded-proto'];
  const xForwardedHost = req.headers['x-forwarded-host'];

  if (cfVisitor || xForwardedProto) {
    console.log(`[Cloudflare] Request from ${req.headers['cf-connecting-ip'] || req.ip}`);
  }
  next();
});
```

**Purpose**: Logs Cloudflare-specific connection information for debugging.

#### 4. Static File Serving

```javascript
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Purpose**:
- Serves static files (index.html, images, etc.)
- Enables JSON body parsing
- Enables URL-encoded body parsing

#### 5. IZITGreen API Configuration

```javascript
const IZIT_API_BASE = process.env.IZIT_API_BASE || 'http://portail.izit.green:8083';
const IZIT_USERNAME = process.env.IZIT_USERNAME || 'Vincent';
const IZIT_PASSWORD = process.env.IZIT_PASSWORD || 'Admin.1024';
const TOKEN_VALIDITY_MS = 50 * 60 * 1000; // 50 minutes

let cachedToken = null;
let tokenTimestamp = 0;
```

**Purpose**: Configures connection to IZITGreen building automation system with token caching.

#### 6. Token Management Function

```javascript
async function getIZITAccessToken() {
  const now = Date.now();
  if (cachedToken && now - tokenTimestamp < TOKEN_VALIDITY_MS) {
    return cachedToken;
  }

  const fetch = (await import('node-fetch')).default;
  const params = new URLSearchParams({
    grant_type: 'password',
    username: IZIT_USERNAME,
    password: IZIT_PASSWORD
  });

  const response = await fetch(`${IZIT_API_BASE}/GetToken`, {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const data = await response.json();
  cachedToken = data.access_token;
  tokenTimestamp = now;
  return cachedToken;
}
```

**Purpose**:
- Obtains OAuth2 access token from IZITGreen API
- Implements token caching to reduce API calls
- Tokens are cached for 50 minutes and reused

#### 7. API Endpoints

##### `/api/izit/sites` - Get Building Sites

```javascript
app.get('/api/izit/sites', async (req, res) => {
  const token = await getIZITAccessToken();
  const url = `${IZIT_API_BASE}/Containers/00%252FIZITGreen%252FServers/Children`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  const siteNames = data.map(item => item.Name).filter(Boolean);
  res.json({ sites: siteNames, count: siteNames.length });
});
```

**Purpose**: Retrieves list of connected building sites from IZITGreen.

##### `/api/izit/clients` - Get Interface Clients

```javascript
app.get('/api/izit/clients', async (req, res) => {
  const token = await getIZITAccessToken();
  const url = `${IZIT_API_BASE}/Containers/00%252FIZITGreen%252FInterfaceClient/Children`;
  // Similar implementation to /sites
});
```

**Purpose**: Retrieves list of interface clients connected to IZITGreen.

##### `/api/izit/status` - Complete Building Status

```javascript
app.get('/api/izit/status', async (req, res) => {
  const token = await getIZITAccessToken();

  const [sitesResponse, clientsResponse] = await Promise.all([
    fetch(sitesUrl, { headers: { 'Authorization': `Bearer ${token}` }}),
    fetch(clientsUrl, { headers: { 'Authorization': `Bearer ${token}` }})
  ]);

  // Calculate metrics based on connected systems
  const energyEfficiency = Math.min(95, 75 + activeSystems);
  const carbonReduction = Math.round(45 + (activeSystems * 12));

  res.json({ connected: true, sites, clients, metrics });
});
```

**Purpose**:
- Retrieves comprehensive building status
- Calculates energy efficiency metrics
- Returns carbon reduction and water conservation data

##### `/api/trend-samples` - Temperature Sensor Data

```javascript
app.get('/api/trend-samples', async (req, res) => {
  const { trendId, orderBy = 'SampleDateAscending' } = req.query;
  const token = await getIZITAccessToken();
  const encodedTrendId = encodeURIComponent(trendId);
  const url = `${IZIT_API_BASE}/TrendSamples?trendId=${encodedTrendId}&orderBy=${orderBy}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  res.json(data);
});
```

**Purpose**: Retrieves historical temperature sensor data for graphing.

##### `/api/air-quality` - Paris Air Quality

```javascript
app.get('/api/air-quality', async (req, res) => {
  const response = await fetch(
    'https://air-quality-api.open-meteo.com/v1/air-quality?' +
    'latitude=48.8566&longitude=2.3522&' +
    'current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone'
  );

  const data = await response.json();

  // Calculate AQI status
  const getAQIStatus = (aqi) => {
    if (aqi <= 20) return { status: 'Excellent', color: 'var(--primary)' };
    if (aqi <= 40) return { status: 'Bon', color: 'var(--success)' };
    // ... more thresholds
  };

  res.json({ aqi: data.current.european_aqi, status: aqiStatus, components });
});
```

**Purpose**: Fetches real-time air quality data for Paris using Open-Meteo API.

##### `/api/weather` - Comprehensive Weather Data

```javascript
app.get('/api/weather', async (req, res) => {
  const response = await fetch(
    'https://api.open-meteo.com/v1/forecast?' +
    'latitude=48.8566&longitude=2.3522&' +
    'current=temperature_2m,humidity,precipitation,wind_speed&' +
    'hourly=temperature_2m,precipitation&' +
    'daily=temperature_max,temperature_min'
  );

  const data = await response.json();

  // Calculate energy consumption based on weather
  const calculateEnergyConsumption = (temp, humidity, cloudCover, windSpeed) => {
    let hvacConsumption = 50;
    const tempDiff = Math.abs(temp - 20);
    hvacConsumption += tempDiff * 2.5;
    // More calculations...
    return { hvac, lighting, total };
  };

  res.json({ current, energy, hourly, daily });
});
```

**Purpose**:
- Fetches comprehensive weather data
- Calculates predicted HVAC energy consumption
- Provides hourly and daily forecasts

---

## Frontend Code

### index.html - Dashboard Interface

The frontend is a single-page application built with vanilla JavaScript and Chart.js.

#### 1. Document Structure

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion Énergétique • Daveyzieux - Tableau de Bord</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

**Purpose**: Sets up the HTML document with responsive viewport and Chart.js library.

#### 2. CSS Variables and Theming

```css
:root {
    --primary: #10b981;        /* Primary green */
    --primary-dark: #059669;   /* Darker green */
    --bg-dark: #1a1f2e;        /* Dark background */
    --bg-card: #252d3d;        /* Card background */
    --text-primary: #f8fafc;   /* White text */
    --border: #3d4758;         /* Border color */
}
```

**Purpose**: Defines consistent color scheme using CSS custom properties.

#### 3. Layout System

The dashboard uses a flexible grid layout:

```css
.top-nav {
    /* Header with logo and system info */
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
}

.main-content {
    /* Main dashboard grid */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1vh;
}
```

**Purpose**: Creates responsive grid layout that adapts to screen size.

#### 4. JavaScript Data Fetching

```javascript
async function fetchWeatherData() {
    try {
        const response = await fetch('/api/weather');
        const data = await response.json();
        updateWeatherDisplay(data);
        updateEnergyChart(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}
```

**Purpose**: Fetches data from backend API and updates UI.

#### 5. Chart.js Integration

```javascript
function createTemperatureChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.hourly.time,
            datasets: [{
                label: 'Temperature',
                data: data.hourly.temperature,
                borderColor: 'rgb(16, 185, 129)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
```

**Purpose**: Creates interactive temperature charts using Chart.js.

#### 6. Real-time Updates

```javascript
// Refresh data every 5 minutes
setInterval(() => {
    fetchWeatherData();
    fetchAirQuality();
    fetchIZITStatus();
}, 5 * 60 * 1000);
```

**Purpose**: Keeps dashboard data fresh with automatic updates.

---

## Docker Configuration

### Dockerfile - Container Build

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server.js .
COPY index.html .
COPY Logo-Brico-Marche.png .

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3001/api/weather', ...)"

CMD ["node", "server.js"]
```

**Key Features**:
- Uses lightweight Alpine Linux
- Runs as non-root user for security
- Includes health check for monitoring
- Production-optimized dependencies

### docker-compose.yml - Development Setup

```yaml
version: '3.8'

services:
  weather-dashboard:
    build: .
    ports:
      - "3001:3001"
    environment:
      - IZIT_API_BASE=http://10.20.1.100:8083
      - IZIT_USERNAME=Vincent
      - IZIT_PASSWORD=Admin.1024
    restart: unless-stopped
```

**Purpose**: Simple development setup with direct port mapping.

### docker-compose.prod.yml - Production with SSL

```yaml
version: '3.8'

services:
  app:
    build: .
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - app

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
    entrypoint: "/bin/sh -c 'while :; do certbot renew; sleep 12h; done'"
```

**Purpose**: Production setup with nginx reverse proxy and Let's Encrypt SSL.

### docker-compose.ip.yml - IP-Based Deployment

```yaml
services:
  app:
    build: .

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d/ip-ssl.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl:ro
```

**Purpose**: Deployment using self-signed SSL certificate for IP-based access.

---

## Nginx Configuration

### nginx.conf - Main Configuration

```nginx
worker_processes auto;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Gzip compression
    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    include /etc/nginx/conf.d/*.conf;
}
```

**Purpose**:
- Optimizes performance with multi-threading
- Enables gzip compression
- Sets security headers
- Hides nginx version

### default.conf - Let's Encrypt SSL

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:...';

    # HSTS header
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://app:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Purpose**:
- Redirects HTTP to HTTPS
- Configures Let's Encrypt SSL
- Sets up reverse proxy to Node.js
- Enables HTTP/2

### ip-ssl.conf - Self-Signed SSL

```nginx
server {
    listen 443 ssl http2;

    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;

    # Same proxy configuration as default.conf
}
```

**Purpose**: Uses self-signed certificates for IP-based deployment.

---

## Deployment Scripts

### deploy-ubuntu.sh - Domain-Based Deployment

**Purpose**: Automated deployment script for Ubuntu servers with domain names.

**What it does**:

1. **Prerequisites Check**
   ```bash
   check_prerequisites() {
     if ! command -v docker; then
       curl -fsSL https://get.docker.com | sh
       usermod -aG docker $USER
     fi
   }
   ```
   - Installs Docker if missing
   - Installs Docker Compose

2. **User Input Collection**
   ```bash
   gather_input() {
     read -p "Enter domain name: " DOMAIN
     read -p "Enter email for Let's Encrypt: " EMAIL
     read -p "IZITGreen API Base URL: " IZIT_API_BASE
   }
   ```
   - Prompts for domain name
   - Gets email for SSL certificates
   - Collects IZITGreen credentials

3. **SSL Certificate Generation**
   ```bash
   obtain_certificates() {
     docker compose run certbot certonly \
       --webroot \
       --webroot-path=/var/www/certbot \
       --email $EMAIL \
       -d $DOMAIN
   }
   ```
   - Uses Certbot to get Let's Encrypt certificate
   - Configures auto-renewal

4. **Service Startup**
   ```bash
   start_services() {
     docker compose -f docker-compose.prod.yml build
     docker compose -f docker-compose.prod.yml up -d
   }
   ```
   - Builds Docker images
   - Starts all services

### deploy-ip.sh - IP-Based Deployment

**Purpose**: Deployment for servers accessed via IP address (no domain).

**What it does**:

1. **IP Detection**
   ```bash
   get_server_ip() {
     SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
   }
   ```
   - Auto-detects server IP
   - Falls back to manual entry

2. **Self-Signed Certificate**
   ```bash
   generate_ssl_certificate() {
     cat > ssl/openssl.cnf <<EOF
   [alt_names]
   IP.1 = $SERVER_IP
   EOF

     openssl req -x509 -nodes -days 365 \
       -newkey rsa:2048 \
       -keyout ssl/server.key \
       -out ssl/server.crt \
       -config ssl/openssl.cnf
   }
   ```
   - Creates self-signed SSL certificate
   - Valid for 365 days
   - Includes IP in SAN (Subject Alternative Name)

3. **Firewall Configuration**
   ```bash
   configure_firewall() {
     sudo ufw allow 80/tcp
     sudo ufw allow 443/tcp
     sudo ufw allow 22/tcp
   }
   ```
   - Opens ports 80 (HTTP), 443 (HTTPS), 22 (SSH)

---

## Environment Variables

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment mode |
| `PORT` | `3001` | Server port |
| `HOST` | `0.0.0.0` | Server bind address |
| `IZIT_API_BASE` | `http://portail.izit.green:8083` | IZITGreen API URL |
| `IZIT_USERNAME` | `Vincent` | IZITGreen username |
| `IZIT_PASSWORD` | `Admin.1024` | IZITGreen password |

### .env File Example

```bash
# IZITGreen API Configuration
IZIT_API_BASE=http://10.20.1.100:8083
IZIT_USERNAME=Vincent
IZIT_PASSWORD=Admin.1024

# Domain Configuration (for deploy-ubuntu.sh)
DOMAIN=dashboard.example.com
EMAIL=admin@example.com
```

---

## API Reference

### External APIs Used

#### 1. IZITGreen Portal API

**Base URL**: `http://portail.izit.green:8083`

**Authentication**: OAuth2 Password Grant

**Endpoints**:
- `POST /GetToken` - Obtain access token
- `GET /Containers/{path}/Children` - Get container children
- `GET /Values/{path}/Value` - Get value data
- `GET /TrendSamples` - Get trend sample data

#### 2. Open-Meteo Weather API

**Base URL**: `https://api.open-meteo.com/v1/forecast`

**Parameters**:
- `latitude=48.8566` (Paris)
- `longitude=2.3522` (Paris)
- `current=temperature_2m,humidity,wind_speed`
- `hourly=temperature_2m,precipitation`
- `daily=temperature_max,temperature_min`

**Response**: JSON with current, hourly, and daily data

#### 3. Open-Meteo Air Quality API

**Base URL**: `https://air-quality-api.open-meteo.com/v1/air-quality`

**Parameters**:
- `latitude=48.8566`
- `longitude=2.3522`
- `current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`

**Response**: JSON with AQI and pollutant levels

---

## Key Features

### 1. Token Caching

The application implements intelligent token caching to reduce API calls:

```javascript
let cachedToken = null;
let tokenTimestamp = 0;
const TOKEN_VALIDITY_MS = 50 * 60 * 1000; // 50 minutes

async function getIZITAccessToken() {
  const now = Date.now();
  if (cachedToken && now - tokenTimestamp < TOKEN_VALIDITY_MS) {
    return cachedToken; // Use cached token
  }
  // Request new token
}
```

**Benefits**:
- Reduces load on IZITGreen API
- Faster response times
- Automatic token refresh

### 2. Energy Consumption Calculation

Calculates predicted HVAC energy consumption based on weather:

```javascript
const calculateEnergyConsumption = (temp, humidity, cloudCover, windSpeed) => {
  let hvacConsumption = 50; // Base consumption

  // Temperature impact
  const tempDiff = Math.abs(temp - 20);
  hvacConsumption += tempDiff * 2.5;

  // Humidity impact
  if (humidity > 70 || humidity < 30) {
    hvacConsumption += 15;
  }

  // Lighting based on cloud cover
  let lightingConsumption = (cloudCover / 100) * 25;

  return { hvac, lighting, total };
};
```

**Purpose**: Helps predict building energy usage based on environmental conditions.

### 3. Health Checks

Docker health checks ensure service availability:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/weather', (r) => {
    process.exit(r.statusCode === 200 ? 0 : 1)
  })"
```

**Benefits**:
- Automatic container restart on failure
- Monitoring integration
- High availability

### 4. Security Features

**Backend Security**:
- Non-root Docker user
- Environment variable configuration
- Trust proxy for secure header handling

**Nginx Security**:
- Modern TLS 1.2/1.3 only
- Security headers (HSTS, X-Frame-Options, etc.)
- Hidden server version
- DH parameters for forward secrecy

**SSL Options**:
- Let's Encrypt for domain-based (free, trusted)
- Self-signed for IP-based (works but shows warning)

### 5. Responsive Design

The dashboard uses modern CSS techniques:

```css
.main-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1vh;
}
```

**Features**:
- Flexible grid layout
- Viewport-relative units (vh, vw)
- Mobile-responsive
- Adaptive card sizing

### 6. Real-Time Data Updates

```javascript
// Refresh every 5 minutes
setInterval(() => {
    fetchWeatherData();
    fetchAirQuality();
    fetchIZITStatus();
}, 5 * 60 * 1000);
```

**Purpose**: Keeps dashboard current without page refresh.

### 7. Error Handling

Comprehensive error handling throughout:

```javascript
try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
} catch (error) {
    console.error('Error:', error);
    res.json({ error: error.message, connected: false });
}
```

**Benefits**:
- Graceful degradation
- User-friendly error messages
- Detailed logging

---

## Quick Start Commands

### Development

```bash
# Install dependencies
npm install

# Run locally
npm start

# Access at http://localhost:3001
```

### Production Deployment (Domain)

```bash
# Run deployment script
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh

# Access at https://yourdomain.com
```

### Production Deployment (IP)

```bash
# Run IP deployment script
chmod +x deploy-ip.sh
./deploy-ip.sh

# Access at https://your-server-ip
```

### Docker Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down

# Update application
docker compose -f docker-compose.prod.yml up -d --build app
```

---

## Troubleshooting

### Common Issues

**1. Can't connect to IZITGreen API**
- Check `IZIT_API_BASE` environment variable
- Verify network connectivity to IZITGreen server
- Check username/password credentials

**2. SSL Certificate errors**
- Domain deployments: Ensure DNS points to server IP
- IP deployments: Browser warning is normal, click "Proceed anyway"
- Check certificate expiry: `openssl x509 -in ssl/server.crt -text`

**3. Docker permission denied**
- Add user to docker group: `sudo usermod -aG docker $USER`
- Log out and log back in

**4. Port already in use**
- Check what's using port: `sudo netstat -tlnp | grep :443`
- Stop conflicting service or change port

---

## Conclusion

This application provides a comprehensive building analytics solution with:

- **Real-time monitoring** of weather, air quality, and building systems
- **Secure deployment** with SSL/TLS encryption
- **Scalable architecture** using Docker and nginx
- **Automated deployment** scripts for easy setup
- **Professional UI** with responsive design and interactive charts

The code is production-ready with health checks, error handling, logging, and security best practices.
