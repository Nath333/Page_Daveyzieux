# Brico_Dave_Html - Project Structure

Professional building analytics and environmental monitoring dashboard with modular, production-grade architecture.

## Overview

This project follows a **modular multi-tier architecture** with:
- **Backend**: Modular Node.js/Express with service layer pattern
- **Frontend**: Static files served from `public/` directory
- **Infrastructure**: Docker multi-container with nginx reverse proxy
- **Documentation**: Comprehensive guides in `docs/` folder

## Directory Structure

```
brico-dave-html/
├── server.js                    # Application entry point (minimal)
├── package.json                 # Dependencies and scripts
├── .dockerignore                # Docker build exclusions
├── .gitignore                   # Git exclusions
│
├── src/                        # Modular backend source code
│   ├── app.js                  # Express app configuration & setup
│   │
│   ├── config/                 # Configuration management
│   │   └── config.js           # Centralized configuration
│   │
│   ├── services/               # Business logic layer
│   │   ├── izitGreenService.js # IZITGreen API integration
│   │   ├── weatherService.js   # Weather API & energy calculations
│   │   └── airQualityService.js# Air quality monitoring
│   │
│   ├── routes/                 # API route handlers
│   │   ├── izitGreenRoutes.js  # /api/izit/* endpoints
│   │   ├── weatherRoutes.js    # /api/weather endpoint
│   │   └── airQualityRoutes.js # /api/air-quality endpoint
│   │
│   ├── middleware/             # Express middleware
│   │   └── proxyMiddleware.js  # nginx reverse proxy handling
│   │
│   └── utils/                  # Utility functions (future)
│
├── public/                     # Static frontend assets
│   ├── index.html              # Main dashboard HTML
│   ├── css/
│   │   └── styles.css          # Complete styling
│   ├── js/
│   │   └── app.js              # Frontend JavaScript (future)
│   └── images/
│       └── logo/               # Branding assets
│
├── docs/                       # Complete documentation
│   ├── README.md               # Documentation index
│   ├── CODE-DOCUMENTATION.md   # Technical code documentation
│   ├── DEPLOYMENT.md           # Production deployment guide
│   ├── STRUCTURE.md            # This file - architecture guide
│   └── NGINX.md                # nginx reverse proxy docs
│
├── nginx.conf                  # nginx reverse proxy configuration
├── Dockerfile                  # Node.js app container build
├── Dockerfile.nginx            # nginx container build
└── docker-compose.yml          # Multi-container orchestration
```

## Architecture Overview

### Backend (Node.js + Express)

**Layered Architecture:**
1. **Entry Point** (`server.js`) - Minimal, just starts the app
2. **Application** (`src/app.js`) - Express setup, middleware, routes
3. **Routes** (`src/routes/`) - Handle HTTP requests, call services
4. **Services** (`src/services/`) - Business logic, external API calls
5. **Config** (`src/config/`) - Centralized configuration

**Benefits:**
- ✅ Separation of concerns
- ✅ Easy to test individual modules
- ✅ Scalable and maintainable
- ✅ Clear dependency flow

### Frontend (HTML + CSS + JavaScript)

**Separated Files:**
- `index.html` - Structure only, links to external CSS/JS
- `styles.css` - All styling including responsive design
- `app.js` - All JavaScript functionality

**Benefits:**
- ✅ Browser caching efficiency
- ✅ Easier to maintain and debug
- ✅ Better developer experience
- ✅ Ready for build tools (minification, bundling)

## API Endpoints

### Weather & Environment
- `GET /api/weather` - Weather data with energy forecasts
- `GET /api/air-quality` - Air quality data for Paris

### IZITGreen Building Automation
- `GET /api/izit/status` - Complete building status
- `GET /api/izit/sites` - Connected sites
- `GET /api/izit/clients` - Interface clients
- `GET /api/izit/smart-connector/value` - Smart Connector value
- `GET /api/izit/trend-samples?trendId={id}` - Trend data

## Configuration

All configuration is centralized in `src/config/config.js`:
- Server settings (port, host, proxy)
- IZITGreen API credentials
- Weather/Air Quality API settings
- Energy calculation constants

**Environment Variables:**
```bash
PORT=3001                                    # Server port
HOST=0.0.0.0                                 # Server host
IZIT_API_BASE=http://portail.izit.green:8083
IZIT_USERNAME=Vincent
IZIT_PASSWORD=Admin.1024
```

## Running the Application

### Development
```bash
npm start
# or
node server.js
```

### Production (Docker + nginx)
```bash
docker-compose up -d
```

Accesses at: http://localhost (nginx reverse proxy)

## Key Features

1. **Modular Backend** - Clean separation of routes, services, config
2. **Service Layer** - Reusable business logic
3. **nginx Compatible** - Proxy middleware for X-Forwarded headers
4. **Responsive Frontend** - Supports mobile to 8K displays
5. **Real-time Data** - Weather, air quality, building automation
6. **Energy Analytics** - Weather-based energy consumption forecasting

## Development Guidelines

### Adding New Features

**New API Endpoint:**
1. Create service in `src/services/`
2. Create route in `src/routes/`
3. Import route in `src/app.js`

**New Configuration:**
1. Add to `src/config/config.js`
2. Use environment variables for sensitive data

**Frontend Changes:**
- HTML structure → `public/index.html`
- Styling → `public/css/styles.css`
- Logic → `public/js/app.js`

### Code Style

- **Services**: Business logic only, no HTTP handling
- **Routes**: HTTP handling only, delegate to services
- **Config**: Single source of truth for all settings
- **Naming**: Descriptive, consistent (camelCase for JS)

## Future Improvements

- [ ] Add TypeScript for type safety
- [ ] Implement caching layer (Redis)
- [ ] Add unit tests (Jest)
- [ ] Add API rate limiting
- [ ] Add logging service (Winston)
- [ ] Add monitoring (Prometheus)
- [ ] Split frontend into components (React/Vue)
- [ ] Add build process (Webpack/Vite)

## Notes

- **Multi-Container Setup**: Uses nginx + Node.js in separate containers
- **Token Caching**: IZITGreen tokens cached for 50 minutes
- **Static Files**: Served from `public/` directory via nginx
- **Modular Backend**: Clean separation of routes, services, and configuration
- **Production Ready**: Health checks, auto-restart, logging, security headers

## Related Documentation

- [Main README](../README.md) - Project overview and quick start
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Code Documentation](CODE-DOCUMENTATION.md) - Detailed code walkthrough
- [NGINX Configuration](NGINX.md) - Reverse proxy setup
- [Documentation Index](README.md) - Complete documentation guide

---

**Last Updated:** December 5, 2025
**Document Version:** 2.0
**Architecture:** Multi-tier with nginx reverse proxy

---

[← Back to Documentation Index](README.md)
