# Nginx Reverse Proxy Configuration

## Overview

This project implements a **professional nginx reverse proxy layer** sitting in front of the Node.js Express backend. This architecture provides enhanced security, performance, and scalability for the Brico Dave Analytics Dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet / Client                     │
└──────────────────────┬──────────────────────────────────┘
                       │ Port 3001
                       ▼
┌─────────────────────────────────────────────────────────┐
│              NGINX Reverse Proxy Layer                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Rate Limiting (API: 10/s, General: 30/s)      │   │
│  │ • Gzip Compression (6x)                          │   │
│  │ • Security Headers (XSS, CSRF, Clickjacking)    │   │
│  │ • Static File Caching (30 days)                 │   │
│  │ • Cloudflare Real IP Detection                  │   │
│  │ • WebSocket Support                             │   │
│  │ • Health Check Endpoint (/health)               │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ Internal Network
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js Backend (Express)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • API Endpoints                                  │   │
│  │ • IZITGreen Integration                         │   │
│  │ • Weather & Air Quality APIs                    │   │
│  │ • Business Logic                                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
              External APIs (IZITGreen, Open-Meteo)
```

## Key Files

### 1. `nginx.conf`
Main nginx configuration file with:
- **Upstream Definition**: Connection pooling to Node.js backend
- **Server Block**: Request routing and processing
- **Location Blocks**: Different handling for API vs static files
- **Security**: Headers, rate limiting, IP filtering
- **Performance**: Gzip, caching, buffering

### 2. `Dockerfile.nginx`
Custom nginx Docker image that:
- Extends `nginx:1.25-alpine`
- Installs `wget` for health checks
- Copies nginx configuration
- Configures health check endpoint

### 3. `docker-compose.yml`
Orchestrates both services:
- **nginx service**: Public-facing (port 3001 → 80)
- **weather-dashboard service**: Internal only (port 3001, not exposed)
- **app-network**: Bridge network for inter-container communication

## Features

### 🔒 Security

#### Security Headers
```nginx
X-Frame-Options: SAMEORIGIN              # Prevents clickjacking
X-Content-Type-Options: nosniff          # Prevents MIME sniffing
X-XSS-Protection: 1; mode=block          # XSS protection
Referrer-Policy: no-referrer-when-downgrade  # Privacy
```

#### Rate Limiting
- **API endpoints** (`/api/*`): 10 requests/second with burst of 20
- **General traffic** (`/`): 30 requests/second with burst of 50
- Prevents DoS attacks and API abuse

#### Cloudflare Integration
- Configured to detect real client IPs behind Cloudflare Tunnel
- Supports all Cloudflare IPv4 and IPv6 ranges
- Reads `CF-Connecting-IP` header for accurate logging

### ⚡ Performance

#### Gzip Compression
- Compression level: 6 (optimal balance)
- Types: HTML, CSS, JS, JSON, XML, fonts, SVG
- Typical savings: 60-80% bandwidth reduction

#### Static File Caching
- **Images, fonts, CSS, JS**: 30-day browser cache
- `Cache-Control: public, immutable` for optimal performance
- Reduces server load and improves page load times

#### Connection Pooling
- Keepalive connections to backend: 64 concurrent
- HTTP/1.1 with persistent connections
- Reduces connection overhead

### 🔌 WebSocket Support
```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```
Ready for future real-time features (live dashboards, notifications).

### 📊 Health Monitoring

#### Nginx Health Check
```bash
curl http://localhost:3001/health
# Response: 200 OK "healthy"
```

#### Backend Health Check
```bash
docker-compose ps
# Both services should show "healthy"
```

## Configuration Details

### Upstream Backend
```nginx
upstream nodejs_backend {
    server weather-dashboard:3001;
    keepalive 64;
}
```
- DNS name resolves via Docker network
- Keepalive pool of 64 connections
- Automatic failover (if multiple backends added)

### Location Routing

#### API Endpoints (`/api/*`)
```nginx
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://nodejs_backend;
    # Full proxy headers...
}
```
- Stricter rate limiting for APIs
- Full proxy headers preserved
- 60-second timeouts

#### Static Files (`/`)
```nginx
location / {
    try_files $uri @nodejs;
}

location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```
- Tries to serve from nginx first (future optimization)
- Falls back to Node.js backend
- Long cache headers for assets

### Proxy Headers
All requests include:
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;
```

## Deployment

### Build and Deploy
```bash
# Stop existing containers
docker-compose down

# Build both images (nginx + nodejs)
docker-compose build

# Start services
docker-compose up -d

# Check health status
docker-compose ps

# View logs
docker-compose logs -f nginx
docker-compose logs -f weather-dashboard
```

### Update Nginx Configuration
```bash
# Edit nginx.conf
nano nginx.conf

# Rebuild nginx image
docker-compose build nginx

# Reload configuration (zero downtime)
docker-compose exec nginx nginx -s reload

# Or restart nginx service
docker-compose restart nginx
```

### Update Backend Code
```bash
# Edit application code
nano src/app.js

# Rebuild backend
docker-compose build weather-dashboard

# Restart backend
docker-compose restart weather-dashboard
```

## Monitoring

### Access Logs
```bash
# Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log

# Filter for errors only
docker-compose exec nginx tail -f /var/log/nginx/error.log

# View specific IP
docker-compose exec nginx grep "192.168.1.100" /var/log/nginx/access.log
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Test nginx health endpoint
curl http://localhost:3001/health

# Test backend API
curl http://localhost:3001/api/weather

# Check rate limiting (should hit limit after 10 requests/sec)
for i in {1..15}; do curl http://localhost:3001/api/weather & done
```

### Performance Monitoring
```bash
# Monitor nginx processes
docker-compose exec nginx ps aux

# Check connection count
docker stats smart-building-nginx

# Test compression
curl -H "Accept-Encoding: gzip" -I http://localhost:3001/

# Response time testing
time curl -s http://localhost:3001/api/weather > /dev/null
```

## Troubleshooting

### Nginx Won't Start
```bash
# Test configuration syntax
docker-compose exec nginx nginx -t

# Check logs
docker-compose logs nginx

# Common issues:
# - Port 3001 already in use
# - Syntax error in nginx.conf
# - Backend not healthy yet (dependency issue)
```

### 502 Bad Gateway
```bash
# Backend might be down
docker-compose ps

# Check backend logs
docker-compose logs weather-dashboard

# Verify network connectivity
docker-compose exec nginx ping weather-dashboard
```

### Rate Limiting Too Strict
Edit `nginx.conf`:
```nginx
# Increase rate limits
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=50r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;
```
Then reload: `docker-compose exec nginx nginx -s reload`

### WebSocket Connection Issues
```bash
# Check WebSocket headers
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:3001/api/websocket

# Verify map directive in nginx.conf
docker-compose exec nginx nginx -T | grep connection_upgrade
```

## Security Best Practices

### ✅ Implemented
- [x] Non-root user in both containers
- [x] Security headers (XSS, CSRF, Clickjacking)
- [x] Rate limiting on all endpoints
- [x] Gzip compression
- [x] Health checks
- [x] Log rotation (10MB max, 3 files)
- [x] Cloudflare real IP detection
- [x] Hidden file blocking (`/.*`)

### 🔄 Recommended Additions

#### SSL/TLS with Let's Encrypt
```yaml
# Add to docker-compose.yml
certbot:
  image: certbot/certbot
  volumes:
    - ./certbot/conf:/etc/letsencrypt
    - ./certbot/www:/var/www/certbot
```

#### Additional Security Headers
```nginx
# Add to nginx.conf
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'" always;
add_header Permissions-Policy "geolocation=(), microphone=()" always;
```

#### IP Whitelisting (if needed)
```nginx
# Restrict admin endpoints
location /api/admin/ {
    allow 192.168.1.0/24;
    deny all;
    proxy_pass http://nodejs_backend;
}
```

## Performance Tuning

### For High Traffic
```nginx
# Increase worker connections
events {
    worker_connections 4096;
    use epoll;
}

# Adjust keepalive
upstream nodejs_backend {
    server weather-dashboard:3001;
    keepalive 256;
}

# Increase rate limits
limit_req_zone $binary_remote_addr zone=api_limit:20m rate=100r/s;
```

### For Low-Resource Environments
```nginx
# Reduce workers
worker_processes 1;

# Lower keepalive
upstream nodejs_backend {
    server weather-dashboard:3001;
    keepalive 16;
}

# Disable gzip
gzip off;
```

## Maintenance

### Regular Tasks
- Monitor disk space for logs
- Review access logs for suspicious activity
- Update nginx image periodically
- Test health checks weekly
- Review and adjust rate limits based on usage

### Backup Configuration
```bash
# Backup nginx config
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d)

# Backup entire setup
tar -czf brico-dave-backup.tar.gz \
  nginx.conf Dockerfile.nginx docker-compose.yml
```

## References

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Nginx Rate Limiting Guide](https://www.nginx.com/blog/rate-limiting-nginx/)
- [Cloudflare IP Ranges](https://www.cloudflare.com/ips/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)

---

**Version**: 1.0
**Last Updated**: 2025-12-05
**Maintainer**: Brico Dave Analytics Team
