# Tests Directory

This directory is reserved for application tests. Currently empty - tests should be added as the project grows.

## Recommended Testing Structure

```
tests/
├── unit/                    # Unit tests
│   ├── services/
│   │   ├── weatherService.test.js
│   │   ├── airQualityService.test.js
│   │   └── izitGreenService.test.js
│   ├── middleware/
│   │   ├── errorHandler.test.js
│   │   └── securityHeaders.test.js
│   └── utils/
│       ├── constants.test.js
│       └── fetchUtil.test.js
├── integration/             # Integration tests
│   ├── api/
│   │   ├── weather.test.js
│   │   ├── airQuality.test.js
│   │   └── izitGreen.test.js
│   └── app.test.js
└── e2e/                     # End-to-end tests
    └── dashboard.test.js
```

## Getting Started with Testing

### 1. Install Testing Dependencies

```bash
npm install --save-dev jest supertest @types/jest
```

### 2. Configure Jest

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/config/*.js"
    ]
  }
}
```

### 3. Write Your First Test

**Example:** Testing the weather service

```javascript
// tests/unit/services/weatherService.test.js
const weatherService = require('../../../src/services/weatherService');

describe('Weather Service', () => {
  describe('getWeatherData', () => {
    it('should return weather data', async () => {
      const data = await weatherService.getWeatherData();
      expect(data).toBeDefined();
      expect(data).toHaveProperty('temperature');
      expect(data).toHaveProperty('humidity');
    });

    it('should handle errors gracefully', async () => {
      // Mock error scenario
      // Add error handling tests
    });
  });
});
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Testing Guidelines

### Unit Tests

Test individual functions and modules in isolation:

```javascript
// Mock external dependencies
jest.mock('../../../src/utils/fetchUtil');

const { fetch } = require('../../../src/utils/fetchUtil');
const myService = require('../../../src/services/myService');

describe('My Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should fetch data correctly', async () => {
    fetch.mockResolvedValue({ data: 'test' });
    const result = await myService.getData();
    expect(result).toEqual({ data: 'test' });
  });
});
```

### Integration Tests

Test API endpoints with Supertest:

```javascript
// tests/integration/api/weather.test.js
const request = require('supertest');
const app = require('../../../src/app');

describe('Weather API', () => {
  describe('GET /api/weather', () => {
    it('should return weather data', async () => {
      const response = await request(app)
        .get('/api/weather')
        .expect(200);

      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('humidity');
    });

    it('should handle errors with 500 status', async () => {
      // Test error scenarios
    });
  });
});
```

### End-to-End Tests

Test complete user flows (consider using Playwright or Cypress):

```javascript
// tests/e2e/dashboard.test.js
const puppeteer = require('puppeteer');

describe('Dashboard E2E', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should load dashboard', async () => {
    await page.goto('http://localhost:3001');
    const title = await page.title();
    expect(title).toContain('Gestion Énergétique');
  });

  it('should display weather data', async () => {
    await page.waitForSelector('#temperature');
    const temp = await page.$eval('#temperature', el => el.textContent);
    expect(temp).toBeTruthy();
  });
});
```

## Best Practices

### 1. Test Naming
Use descriptive test names that explain what is being tested:
```javascript
describe('WeatherService', () => {
  describe('getTemperature', () => {
    it('should return temperature in Celsius by default', () => {});
    it('should convert to Fahrenheit when specified', () => {});
    it('should throw error when data is unavailable', () => {});
  });
});
```

### 2. Arrange-Act-Assert Pattern
```javascript
it('should calculate total correctly', () => {
  // Arrange
  const input = { price: 100, quantity: 2 };

  // Act
  const result = calculateTotal(input);

  // Assert
  expect(result).toBe(200);
});
```

### 3. Mock External Dependencies
Never make real API calls in tests:
```javascript
jest.mock('../../../src/utils/fetchUtil');
const { fetch } = require('../../../src/utils/fetchUtil');

beforeEach(() => {
  fetch.mockResolvedValue({ data: 'mocked' });
});
```

### 4. Test Edge Cases
- Empty inputs
- Null/undefined values
- Large datasets
- Error scenarios
- Boundary conditions

### 5. Maintain Test Independence
Each test should be able to run independently:
```javascript
beforeEach(() => {
  // Reset state before each test
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});
```

## Coverage Goals

Aim for these coverage targets:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

Generate coverage report:
```bash
npm run test:coverage
```

View HTML coverage report:
```bash
open coverage/lcov-report/index.html
```

## Continuous Integration

Add tests to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Useful Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)

## TODO

- [ ] Set up Jest and testing framework
- [ ] Add unit tests for all services
- [ ] Add integration tests for API endpoints
- [ ] Add E2E tests for critical user flows
- [ ] Set up CI/CD for automated testing
- [ ] Achieve 80%+ code coverage
