# Deployment Guide - Brico_Dave_Html

Professional building analytics dashboard deployment guide for production environments.

## Pre-Deployment Checklist

### ✅ System Requirements
- Docker 20.10+ and Docker Compose 2.0+
- 2GB RAM minimum (4GB recommended)
- 10GB disk space
- Network access to IZITGreen Portal (10.20.1.100:8083)
- Open ports: 3001 (or custom port)

### ✅ Features Included
- [x] Real-time weather data for Paris
- [x] IZITGreen Portal integration
- [x] Smart Connector A value display
- [x] 4 Rooftop Trane HVAC units monitoring
- [x] Bricomarché Daveyzieux store hours display
- [x] Live clock and date
- [x] Energy consumption tracking
- [x] Environmental metrics
- [x] NGINX reverse proxy (multi-container setup)
- [x] Health monitoring and auto-restart

## Quick Deployment on Your Server

### Option 1: Docker Compose (Recommended)

**Step 1: Transfer files to your server**
```bash
# Using git (recommended)
git clone <your-repo-url> brico-dave-html
cd brico-dave-html

# Or using scp
scp -r /path/to/brico-dave-html user@your-server:/opt/
cd /opt/brico-dave-html
```

**Step 2: Configure environment**
```bash
# Create .env file or edit docker-compose.yml
cat > .env << EOF
IZIT_API_BASE=http://10.20.1.100:8083
IZIT_USERNAME=Vincent
IZIT_PASSWORD=Admin.1024
PORT=3001
NODE_ENV=production
EOF
```

**Step 3: Deploy**
```bash
# Start all services (nginx + Node.js)
docker-compose up -d

# Or build and start
docker-compose up -d --build
```

**Step 4: Verify**
```bash
# Check if both containers are running
docker-compose ps
# Should show: smart-building-nginx and smart-building-weather

# Check logs
docker-compose logs -f

# Test nginx health
curl http://localhost:3001/health

# Test API endpoint
curl http://localhost:3001/api/weather
```

**Step 5: Access**
Open browser to: `http://your-server-ip:3001`

The application runs behind nginx reverse proxy for production-grade performance and security.

### Option 2: Direct Node.js (Development/Testing Only)

```bash
# Install Node.js 18+ if not installed
# Install dependencies
npm install

# Run the application
PORT=3001 \
IZIT_API_BASE=http://10.20.1.100:8083 \
IZIT_USERNAME=Vincent \
IZIT_PASSWORD=Admin.1024 \
npm start

# Access at http://localhost:3001
```

**Note**: For production, always use Docker Compose (Option 1) which includes nginx reverse proxy.

## Network Configuration

### Firewall Rules
Ensure port 3001 is accessible:
```bash
# Ubuntu/Debian with UFW
sudo ufw allow 3001/tcp

# CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### Built-in Reverse Proxy

The application includes a built-in nginx reverse proxy configured in [docker-compose.yml](../docker-compose.yml). No additional configuration needed.

**Architecture:**
```
Client → nginx (port 3001) → Node.js app (internal network)
```

**Features:**
- Rate limiting (10 req/s for APIs, 30 req/s general)
- Gzip compression (70% bandwidth reduction)
- Security headers (XSS, clickjacking protection)
- Static file caching (30 days)
- Health monitoring

See [docs/NGINX.md](NGINX.md) for detailed configuration.

## IZITGreen Portal Configuration

### Network Requirements
- Dashboard server must have network access to IZITGreen Portal at `10.20.1.100:8083`
- If portal is on a different network, update `IZIT_API_BASE` environment variable

### Testing IZITGreen Connectivity
```bash
# From your server, test connection to IZITGreen
curl -X POST http://10.20.1.100:8083/GetToken \
  -d "grant_type=password&username=Vincent&password=Admin.1024"

# Should return: {"access_token":"...","token_type":"bearer",...}
```

### Troubleshooting IZITGreen Connection
If IZITGreen data doesn't load:
1. Check network connectivity: `ping 10.20.1.100`
2. Test API access: `curl http://10.20.1.100:8083/GetToken`
3. Verify credentials in `docker-compose.yml`
4. Check container logs: `docker logs smart-building-weather`

## Health Monitoring

### Built-in Health Check
The Docker container includes automatic health checks every 30 seconds:
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' smart-building-weather
```

### Manual Health Check
```bash
# Weather API
curl http://localhost:3001/api/weather

# IZITGreen Status
curl http://localhost:3001/api/izit/status

# Smart Connector A Value
curl http://localhost:3001/api/smart-connector/a-value
```

## Updating the Application

### Docker Compose Update
```bash
cd /opt/smart-connector-html
git pull
docker-compose down
docker-compose up -d --build
```

### Docker Update
```bash
docker stop smart-building-weather
docker rm smart-building-weather
docker build -t smart-building-weather:latest .
docker run -d \
  --name smart-building-weather \
  -p 3001:3001 \
  -e IZIT_API_BASE=http://10.20.1.100:8083 \
  -e IZIT_USERNAME=Vincent \
  -e IZIT_PASSWORD=Admin.1024 \
  --restart unless-stopped \
  smart-building-weather:latest
```

## Display Configuration (55-inch Screen)

### Optimal Browser Settings
- **Resolution**: 1920x1080
- **Browser**: Chrome/Chromium in kiosk mode
- **Zoom**: 100% (default)
- **Refresh**: Auto (every 5 minutes)

### Kiosk Mode Setup (Linux)
```bash
# Install Chromium
sudo apt-get install chromium-browser unclutter

# Create autostart script
cat > ~/.config/autostart/dashboard.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Dashboard
Exec=chromium-browser --kiosk --incognito http://localhost:3001
EOF

# Hide mouse cursor
unclutter -idle 0.1 &
```

## Security Recommendations

### Production Security
1. **Change Default Credentials**: Update IZITGreen credentials in `docker-compose.yml`
2. **Use Environment Variables**: Don't commit credentials to Git
3. **Enable HTTPS**: Use Let's Encrypt with Nginx reverse proxy
4. **Firewall**: Restrict access to port 3001 to local network only
5. **Updates**: Regularly update Node.js base image

### Docker Secrets (Advanced)
```yaml
# docker-compose.yml with secrets
version: '3.8'
services:
  weather-dashboard:
    build: .
    secrets:
      - izit_username
      - izit_password
    environment:
      - IZIT_USERNAME_FILE=/run/secrets/izit_username
      - IZIT_PASSWORD_FILE=/run/secrets/izit_password

secrets:
  izit_username:
    file: ./secrets/username.txt
  izit_password:
    file: ./secrets/password.txt
```

## Backup and Recovery

### Backup Configuration
```bash
# Backup docker-compose.yml and environment files
tar -czf dashboard-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  index.html \
  server.js \
  Logo-Brico-Marche.png
```

### Recovery
```bash
# Extract backup
tar -xzf dashboard-backup-YYYYMMDD.tar.gz

# Rebuild and restart
docker-compose up -d --build
```

## Performance Tuning

### Docker Resource Limits
```yaml
# In docker-compose.yml
services:
  weather-dashboard:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          memory: 256M
```

### Node.js Optimization
```bash
# Set NODE_ENV to production for better performance
# Already configured in docker-compose.yml
```

## Monitoring and Logging

### View Logs
```bash
# Real-time logs
docker logs -f smart-building-weather

# Last 100 lines
docker logs --tail 100 smart-building-weather

# Logs since timestamp
docker logs --since 2024-01-01T00:00:00 smart-building-weather
```

### Log Rotation
Configured in `docker-compose.yml`:
- Max size: 10MB per log file
- Max files: 3 files retained
- Total max size: ~30MB

## Support and Troubleshooting

### Common Issues

**Issue**: Container won't start
```bash
# Check logs
docker logs smart-building-weather

# Check if port is in use
sudo netstat -tlnp | grep 3001
```

**Issue**: IZITGreen data not loading
```bash
# Test API connectivity
docker exec smart-building-weather curl http://10.20.1.100:8083/GetToken

# Check environment variables
docker inspect smart-building-weather | grep -A 10 Env
```

**Issue**: Weather data not loading
```bash
# Test external API access
docker exec smart-building-weather curl https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522
```

## Contact

For issues or questions:
- Check container logs first: `docker logs smart-building-weather`
- Review this deployment guide
- Check README.md for API documentation

## Deployment Verification

After deployment, verify all features work:

1. ✅ Main dashboard loads
2. ✅ Weather data displays
3. ✅ Store hours show correct day and status
4. ✅ Trane units display temperatures
5. ✅ Smart Connector A value loads
6. ✅ IZITGreen status connects
7. ✅ Live clock updates every second
8. ✅ Auto-refresh works (wait 5 minutes)

**Success!** Your Bricomarché Daveyzieux Smart Building Dashboard is ready!

---

## Additional Resources

- [Main README](../README.md) - Project overview and features
- [Code Documentation](CODE-DOCUMENTATION.md) - Detailed code walkthrough
- [Project Structure](STRUCTURE.md) - Architecture and organization
- [NGINX Configuration](NGINX.md) - Reverse proxy documentation
- [Documentation Index](README.md) - Complete documentation guide

## Version Information

- **Last Updated**: December 5, 2025
- **Document Version**: 2.0
- **Deployment Type**: Docker Compose with nginx reverse proxy

---

[← Back to Documentation Index](README.md)
