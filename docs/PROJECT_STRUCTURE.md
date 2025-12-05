# Project Structure

Comprehensive overview of the Brico_Dave_Html project organization.

## Directory Tree

```
brico-dave-html/
├── .claude/                    # Claude Code configuration
│   └── settings.local.json
├── deployment/                 # Deployment configurations
│   ├── nginx/
│   │   ├── Dockerfile.nginx    # NGINX container configuration
│   │   └── nginx.conf          # NGINX reverse proxy config
│   └── README.md
├── docs/                       # Project documentation
│   ├── CODE-DOCUMENTATION.md   # Code walkthrough
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── NGINX.md                # NGINX configuration guide
│   ├── README.md               # Documentation index
│   └── STRUCTURE.md            # Architecture details
├── public/                     # Static client files
│   ├── css/
│   │   └── styles.css          # Application styles
│   ├── images/
│   │   └── Logo.png            # Company logo
│   ├── js/
│   │   └── app.js              # Client-side JavaScript
│   ├── index.html              # Main dashboard page
│   └── README.md
├── scripts/                    # Utility scripts
│   ├── docker-cleanup.sh       # Docker cleanup utility
│   ├── health-check.sh         # Health monitoring script
│   ├── rebuild.sh              # Complete rebuild script
│   ├── start-dev.sh            # Development startup
│   └── README.md
├── src/                        # Server source code
│   ├── config/
│   │   └── config.js           # Application configuration
│   ├── middleware/
│   │   ├── errorHandler.js     # Error handling middleware
│   │   ├── proxyMiddleware.js  # Proxy header handling
│   │   ├── requestLogger.js    # Request logging
│   │   └── securityHeaders.js  # Security headers
│   ├── routes/
│   │   ├── airQualityRoutes.js # Air quality endpoints
│   │   ├── izitGreenRoutes.js  # Building automation endpoints
│   │   └── weatherRoutes.js    # Weather endpoints
│   ├── services/
│   │   ├── airQualityService.js    # Air quality logic
│   │   ├── izitGreenService.js     # Building automation logic
│   │   └── weatherService.js       # Weather service logic
│   ├── utils/
│   │   ├── constants.js        # Application constants
│   │   └── fetchUtil.js        # HTTP utility functions
│   ├── app.js                  # Express app setup
│   └── README.md
├── tests/                      # Test files (to be implemented)
│   └── README.md
├── .dockerignore               # Docker ignore rules
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Multi-container Docker setup
├── Dockerfile                  # Node.js app container
├── package.json                # Node.js dependencies
├── package-lock.json           # Locked dependencies
├── PROJECT_STRUCTURE.md        # This file
├── README.md                   # Main project README
└── server.js                   # Application entry point
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                       │
│                    (public/index.html)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      NGINX (Port 80)                         │
│                  (deployment/nginx/)                         │
│  • Reverse Proxy                                             │
│  • SSL Termination                                           │
│  • Security Headers                                          │
│  • Gzip Compression                                          │
│  • Rate Limiting                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               NODE.JS APP (Port 3001)                        │
│                   (src/app.js)                               │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │           Middleware Layer                    │          │
│  │  • Security Headers                           │          │
│  │  • Request Logger                             │          │
│  │  • Proxy Middleware                           │          │
│  │  • Error Handler                              │          │
│  └──────────────┬───────────────────────────────┘          │
│                 ▼                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │           Routes Layer                        │          │
│  │  • /api/weather                               │          │
│  │  • /api/air-quality                           │          │
│  │  • /api/izit/*                                │          │
│  └──────────────┬───────────────────────────────┘          │
│                 ▼                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │         Services Layer                        │          │
│  │  • Weather Service                            │          │
│  │  • Air Quality Service                        │          │
│  │  • IZITGreen Service                          │          │
│  └──────────────┬───────────────────────────────┘          │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIs                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Open-Meteo  │  │  Open-Meteo  │  │  IZITGreen   │     │
│  │   Weather    │  │ Air Quality  │  │   Portal     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (`public/`)
**Purpose:** Client-side user interface and interactions

- **index.html** - Dashboard UI structure
- **css/styles.css** - Visual styling and responsive design
- **js/app.js** - Client logic, API calls, and data visualization

### Backend (`src/`)
**Purpose:** Server-side API and business logic

#### Entry Point
- **server.js** - Application bootstrapping and server start
- **app.js** - Express configuration and middleware setup

#### Configuration (`src/config/`)
- **config.js** - Environment variables and application settings

#### Middleware (`src/middleware/`)
- **securityHeaders.js** - Inject security headers (CSP, HSTS, etc.)
- **requestLogger.js** - Log incoming requests
- **proxyMiddleware.js** - Handle nginx proxy headers
- **errorHandler.js** - Global error handling and 404 responses

#### Routes (`src/routes/`)
- **weatherRoutes.js** - `/api/weather` endpoints
- **airQualityRoutes.js** - `/api/air-quality` endpoints
- **izitGreenRoutes.js** - `/api/izit/*` endpoints

#### Services (`src/services/`)
- **weatherService.js** - Weather data fetching and processing
- **airQualityService.js** - Air quality data handling
- **izitGreenService.js** - Building automation integration

#### Utilities (`src/utils/`)
- **fetchUtil.js** - HTTP request wrapper
- **constants.js** - Application-wide constants

### Deployment (`deployment/`)
**Purpose:** Production deployment configurations

- **nginx/Dockerfile.nginx** - NGINX container build
- **nginx/nginx.conf** - Reverse proxy configuration

### Scripts (`scripts/`)
**Purpose:** Development and maintenance utilities

- **start-dev.sh** - Quick development startup
- **health-check.sh** - Application health monitoring
- **docker-cleanup.sh** - Docker resource cleanup
- **rebuild.sh** - Complete rebuild script

### Documentation (`docs/`)
**Purpose:** Comprehensive project documentation

- **README.md** - Documentation index
- **CODE-DOCUMENTATION.md** - Code walkthrough
- **DEPLOYMENT.md** - Deployment instructions
- **STRUCTURE.md** - Architecture details
- **NGINX.md** - NGINX configuration guide

### Tests (`tests/`)
**Purpose:** Automated testing (to be implemented)

- Unit tests for services and utilities
- Integration tests for API endpoints
- End-to-end tests for critical flows

## Data Flow

### 1. Weather Data Flow
```
Client → GET /api/weather
       → weatherRoutes.js
       → weatherService.js
       → Open-Meteo API
       ← Weather data
       ← JSON response
       ← Display in UI
```

### 2. Building Automation Flow
```
Client → GET /api/izit/status
       → izitGreenRoutes.js
       → izitGreenService.js
       → IZITGreen Portal API (Basic Auth)
       ← Building data
       ← JSON response
       ← Display HVAC status
```

### 3. Air Quality Flow
```
Client → GET /api/air-quality
       → airQualityRoutes.js
       → airQualityService.js
       → Open-Meteo Air Quality API
       ← AQI data
       ← JSON response
       ← Display air quality
```

## Configuration Files

### Environment Variables (`.env`)
```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
IZIT_API_BASE=http://10.20.1.100:8083
IZIT_USERNAME=Vincent
IZIT_PASSWORD=Admin.1024
```

### Docker Compose (`docker-compose.yml`)
Defines two services:
1. **nginx** - Reverse proxy on port 3001:80
2. **weather-dashboard** - Node.js app on internal port 3001

### Package Management (`package.json`)
Dependencies:
- express ^4.18.2
- node-fetch ^3.3.2
- dotenv ^16.3.1

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm start
# or
./scripts/start-dev.sh
```

### Docker Development
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Pull latest code
git pull

# Rebuild containers
./scripts/rebuild.sh

# Monitor health
./scripts/health-check.sh

# View logs
docker logs smart-building-nginx -f
docker logs smart-building-weather -f
```

## API Endpoints

### Weather API
- `GET /api/weather` - Current weather and forecasts

### Air Quality API
- `GET /api/air-quality` - Air quality index for Paris

### IZITGreen API
- `GET /api/izit/status` - Complete building status
- `GET /api/izit/sites` - Connected building sites
- `GET /api/izit/clients` - Interface clients
- `GET /api/izit/smart-connector/value` - Smart connector data
- `GET /api/izit/trend-samples` - Historical trend data

### System Endpoints
- `GET /` - Dashboard HTML page
- `GET /health` - Application health check

## Security Layers

### 1. NGINX Layer
- Rate limiting
- Request size limits
- Security headers
- SSL/TLS termination

### 2. Application Layer
- Input validation
- Error sanitization
- Secure headers
- CORS configuration

### 3. External API Layer
- Basic authentication (IZITGreen)
- API key management
- Request timeouts
- Error handling

## Performance Optimizations

### NGINX
- Gzip compression
- Connection pooling
- Static file caching
- Proxy buffering

### Node.js
- Async/await patterns
- Connection reuse
- Response streaming
- Error boundaries

### Frontend
- Minimal external dependencies
- Efficient DOM updates
- Data caching
- Lazy loading

## Monitoring & Logging

### Application Logs
```bash
# View application logs
docker logs smart-building-weather -f

# View nginx logs
docker logs smart-building-nginx -f
```

### Health Monitoring
```bash
# Automated health check
./scripts/health-check.sh

# Docker health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Metrics
- Request count and timing
- API response times
- Error rates
- Resource usage

## Future Enhancements

### Short Term
- [ ] Implement automated tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Set up CI/CD pipeline
- [ ] Add database integration

### Long Term
- [ ] User authentication system
- [ ] Historical data storage
- [ ] Advanced analytics dashboard
- [ ] Mobile responsive improvements
- [ ] Multi-site support

## Key Technologies

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | 18 (Alpine) |
| Framework | Express.js | 4.x |
| Reverse Proxy | NGINX | 1.25 (Alpine) |
| Container | Docker | Latest |
| Orchestration | Docker Compose | 3.8 |
| Frontend | Vanilla JS | ES6+ |
| Charting | Chart.js | 4.4.0 |

## Contributing

When modifying the project structure:

1. Update this document
2. Add README.md to new directories
3. Update relevant documentation in `docs/`
4. Maintain consistent naming conventions
5. Follow the established patterns

## See Also

- [Main README](README.md) - Project overview and quick start
- [Documentation Index](docs/README.md) - All documentation
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Code Documentation](docs/CODE-DOCUMENTATION.md) - Code walkthrough
