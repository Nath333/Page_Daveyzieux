# Brico_Dave_Html Documentation

Welcome to the complete documentation for the Brico_Dave_Html project - a professional building analytics dashboard.

## Quick Links

- [Main README](../README.md) - Project overview, features, and quick start
- [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- [Code Documentation](CODE-DOCUMENTATION.md) - Detailed code walkthrough
- [Project Structure](STRUCTURE.md) - Architecture and directory layout
- [NGINX Configuration](NGINX.md) - Reverse proxy setup and configuration

## Documentation Structure

### [Main README](../README.md)
The primary documentation file containing:
- Project overview and features
- Quick start guide
- Docker deployment instructions
- Architecture diagrams
- API reference
- Environment variables
- Troubleshooting guide

**Start here** if you're new to the project.

### [DEPLOYMENT.md](DEPLOYMENT.md)
Comprehensive deployment guide covering:
- Pre-deployment checklist
- Docker Compose deployment
- Manual Docker build
- Direct Node.js installation
- Network configuration
- IZITGreen Portal setup
- Health monitoring
- Security recommendations
- Backup and recovery

**Use this** when deploying to production.

### [CODE-DOCUMENTATION.md](CODE-DOCUMENTATION.md)
Technical code documentation including:
- Backend code walkthrough (server.js)
- Frontend code explanation (index.html)
- Docker configuration details
- NGINX configuration
- Deployment scripts
- API reference
- Key features implementation

**Reference this** for understanding the codebase.

### [STRUCTURE.md](STRUCTURE.md)
Project organization and architecture:
- Directory structure
- File organization
- Module responsibilities
- API endpoint list
- Configuration overview
- Development guidelines

**Consult this** when adding new features or refactoring.

### [NGINX.md](NGINX.md)
NGINX reverse proxy documentation:
- Architecture overview
- Configuration details
- Security features
- Performance optimizations
- Deployment guide
- Monitoring and troubleshooting
- Maintenance tasks

**Review this** for nginx-specific configuration.

## Getting Started

### New Users
1. Read the [Main README](../README.md) for project overview
2. Follow [Quick Start](../README.md#quick-start) to run locally
3. Review [Architecture](../README.md#architecture) to understand the system

### Developers
1. Check [STRUCTURE.md](STRUCTURE.md) for project organization
2. Read [CODE-DOCUMENTATION.md](CODE-DOCUMENTATION.md) for implementation details
3. Follow development guidelines in [STRUCTURE.md](STRUCTURE.md#development-guidelines)

### Operations/DevOps
1. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
2. Configure [NGINX.md](NGINX.md) for reverse proxy
3. Set up monitoring using [Health Monitoring](DEPLOYMENT.md#health-monitoring)

## Key Features

- **IZITGreen Integration**: Real-time building automation data
- **Weather Intelligence**: Current conditions and forecasts
- **Air Quality Monitoring**: European AQI tracking
- **Energy Analytics**: Weather-based consumption predictions
- **Rooftop HVAC**: 4 Trane unit monitoring
- **Store Hours Display**: Bricomarché Daveyzieux schedule
- **Docker Deployment**: Multi-container architecture
- **NGINX Reverse Proxy**: Production-grade security and performance

## Technology Stack

**Backend:**
- Node.js 18 (Alpine Linux)
- Express.js 4.x
- node-fetch 3.x

**Frontend:**
- HTML5/CSS3
- Vanilla JavaScript
- Chart.js (optional)

**Infrastructure:**
- Docker & Docker Compose
- NGINX 1.25 (Alpine)
- Let's Encrypt SSL (optional)

**APIs:**
- IZITGreen Portal API
- Open-Meteo Weather API
- Open-Meteo Air Quality API

## Common Tasks

### Running Locally
```bash
npm install
npm start
# Access at http://localhost:3001
```

### Deploying with Docker
```bash
docker-compose up -d
# Access at http://localhost:3001
```

### Viewing Logs
```bash
docker logs smart-building-weather -f
```

### Updating the Application
```bash
docker-compose down
docker-compose up -d --build
```

## Environment Variables

Configure in [docker-compose.yml](../docker-compose.yml):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `IZIT_API_BASE` | http://10.20.1.100:8083 | IZITGreen API URL |
| `IZIT_USERNAME` | Vincent | IZITGreen username |
| `IZIT_PASSWORD` | Admin.1024 | IZITGreen password |

See [Environment Variables](../README.md#environment-variables) for complete list.

## Support

### Troubleshooting
1. Check [Troubleshooting](../README.md#troubleshooting) section
2. Review [Common Issues](DEPLOYMENT.md#common-issues)
3. Check container logs: `docker logs smart-building-weather`

### Getting Help
- Review documentation thoroughly
- Check GitHub issues
- Verify all environment variables are set correctly

## Contributing

When updating documentation:
1. Keep all docs in the `docs/` folder (except main README)
2. Update this index if adding new documentation
3. Use relative links between documents
4. Follow markdown best practices
5. Keep code examples up to date

## Version Information

- **Last Updated**: December 5, 2025
- **Documentation Version**: 2.0
- **Application Version**: See [package.json](../package.json)

---

**Navigation:**
- [← Back to Main README](../README.md)
- [Deployment Guide →](DEPLOYMENT.md)
