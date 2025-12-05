# Source Code Directory

This directory contains all server-side application code organized by responsibility.

## Directory Structure

```
src/
├── app.js              # Express application setup and middleware configuration
├── config/             # Configuration files and environment settings
├── middleware/         # Express middleware functions
├── routes/             # API route definitions
├── services/           # Business logic and external API integrations
└── utils/              # Utility functions and helpers
```

## Module Responsibilities

### [app.js](app.js)
- Express application configuration
- Middleware setup
- Route registration
- Static file serving
- Error handling setup

### [config/](config/)
- Environment variable management
- Application configuration
- API endpoint definitions
- Server settings

### [middleware/](middleware/)
- **errorHandler.js** - Global error handling and 404 responses
- **proxyMiddleware.js** - Nginx reverse proxy header handling
- **requestLogger.js** - Request logging middleware
- **securityHeaders.js** - Security header injection

### [routes/](routes/)
- **airQualityRoutes.js** - `/api/air-quality` endpoints
- **izitGreenRoutes.js** - `/api/izit/*` endpoints
- **weatherRoutes.js** - `/api/weather` endpoints

### [services/](services/)
- **airQualityService.js** - Air quality data fetching and processing
- **izitGreenService.js** - IZITGreen building automation API integration
- **weatherService.js** - Weather data and forecasting logic

### [utils/](utils/)
- **constants.js** - Application-wide constants
- **fetchUtil.js** - HTTP request utility functions

## Development Guidelines

### Adding New Features

1. **New API Endpoint:**
   - Create route handler in appropriate `routes/` file
   - Implement business logic in `services/`
   - Add middleware if needed in `middleware/`

2. **New External Integration:**
   - Create new service file in `services/`
   - Add configuration to `config/config.js`
   - Update environment variable documentation

3. **New Middleware:**
   - Create middleware file in `middleware/`
   - Register in `app.js`
   - Document usage and purpose

### Code Style

- Use async/await for asynchronous operations
- Implement proper error handling with try/catch
- Add JSDoc comments for functions
- Follow consistent naming conventions:
  - camelCase for functions and variables
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants

### Testing

Place unit tests in the `/tests` directory mirroring the source structure:
```
tests/
├── services/
│   ├── weatherService.test.js
│   └── izitGreenService.test.js
└── middleware/
    └── errorHandler.test.js
```

## Common Tasks

### Adding a New Route
```javascript
// In routes/myNewRoutes.js
const express = require('express');
const router = express.Router();
const myService = require('../services/myService');

router.get('/endpoint', async (req, res, next) => {
  try {
    const data = await myService.getData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### Creating a New Service
```javascript
// In services/myService.js
const { fetch } = require('../utils/fetchUtil');
const config = require('../config/config');

async function getData() {
  const response = await fetch('https://api.example.com/data');
  return response.json();
}

module.exports = { getData };
```

## Environment Variables

Configure in `.env` or `docker-compose.yml`:
- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment (development/production)
- `IZIT_API_BASE` - IZITGreen API base URL
- `IZIT_USERNAME` - IZITGreen username
- `IZIT_PASSWORD` - IZITGreen password

See [.env.example](../.env.example) for complete list.
