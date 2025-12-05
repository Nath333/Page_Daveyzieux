# Docker Configuration

All Docker-related files organized in one place.

## 📁 Folder Structure

```
docker/
├── app/
│   └── Dockerfile                  # Node.js application image
├── nginx/
│   ├── http/
│   │   ├── Dockerfile              # HTTP nginx image
│   │   └── nginx.conf              # HTTP nginx configuration
│   └── https/
│       ├── Dockerfile              # HTTPS nginx image
│       └── nginx.conf              # HTTPS nginx configuration (template)
├── certbot/                        # Created at runtime
│   ├── conf/                       # SSL certificates
│   └── www/                        # Certbot challenges
├── docker-compose.http.yml         # HTTP deployment
├── docker-compose.https.yml        # HTTPS deployment (production)
├── .dockerignore                   # Docker ignore rules
└── README.md                       # This file
```

## 🚀 Quick Start

### HTTP Deployment (Development/Testing)

```bash
cd docker
docker compose -f docker-compose.http.yml up -d --build
```

**Access**: http://localhost:3001

### HTTPS Deployment (Production)

```bash
# From project root
./deploy-https.sh
```

**Access**: https://your-domain.duckdns.org

## 🔧 Docker Images

### Application Image (`app/Dockerfile`)

**Base**: `node:18-alpine`

**Features**:
- Production dependencies only
- Non-root user (security)
- Health check on `/api/weather`
- Optimized for size

**Build**:
```bash
docker build -f docker/app/Dockerfile -t page-daveyzieux-app:latest .
```

### HTTP Nginx Image (`nginx/http/Dockerfile`)

**Base**: `nginx:1.25-alpine`

**Features**:
- Reverse proxy to Node.js app
- Rate limiting
- Gzip compression
- Health checks

**Build**:
```bash
docker build -f docker/nginx/http/Dockerfile -t page-daveyzieux-nginx:http .
```

### HTTPS Nginx Image (`nginx/https/Dockerfile`)

**Base**: `nginx:1.25-alpine`

**Features**:
- SSL/TLS termination
- HTTP → HTTPS redirect
- Let's Encrypt support
- Security headers
- Modern TLS 1.2/1.3

**Build**:
```bash
docker build -f docker/nginx/https/Dockerfile -t page-daveyzieux-nginx:https .
```

## 📝 Configuration Files

### HTTP Nginx Config (`nginx/http/nginx.conf`)

**Port**: 80

**Features**:
- Reverse proxy to app:3001
- Rate limiting (10 req/s API, 30 req/s general)
- Gzip compression
- Security headers
- Static file caching
- Cloudflare IP support

### HTTPS Nginx Config (`nginx/https/nginx.conf`)

**Ports**: 80 (redirect), 443 (HTTPS)

**Features**:
- All HTTP features +
- SSL/TLS with Let's Encrypt
- HTTP → HTTPS redirect
- HSTS header
- Certbot challenge support

**⚠️ Template**: Replace `YOUR_DOMAIN.duckdns.org` with your actual domain before deployment.

## 🐳 Docker Compose Files

### HTTP Compose (`docker-compose.http.yml`)

**Services**:
- `nginx`: HTTP reverse proxy (port 3001)
- `app`: Node.js application

**Use for**:
- Local development
- Internal network deployment
- Testing

**Deploy**:
```bash
cd docker
docker compose -f docker-compose.http.yml up -d --build
```

### HTTPS Compose (`docker-compose.https.yml`)

**Services**:
- `nginx`: HTTPS reverse proxy (ports 80, 443)
- `app`: Node.js application
- `certbot`: SSL certificate management

**Use for**:
- Production deployment
- Public internet access
- DuckDNS + Let's Encrypt

**Deploy**:
```bash
# Use the automated script from project root
./deploy-https.sh
```

## 🔐 HTTPS Setup

### Prerequisites

1. **DuckDNS Account**
   - Domain: `your-domain.duckdns.org`
   - Token from duckdns.org

2. **Open Ports**
   - Port 80 (certbot challenges)
   - Port 443 (HTTPS traffic)

3. **Configure Domain**

Update `docker/nginx/https/nginx.conf`:

```bash
# Replace YOUR_DOMAIN.duckdns.org with your actual domain
sed -i 's/YOUR_DOMAIN\.duckdns\.org/your-domain.duckdns.org/g' docker/nginx/https/nginx.conf
```

Or use the helper script:
```bash
cd deployment
./configure-domain.sh
```

### Get SSL Certificate

```bash
# Create directories
mkdir -p docker/certbot/conf docker/certbot/www

# Get certificate
docker run --rm \
  -v $(pwd)/docker/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/docker/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email your-email@example.com \
  --agree-tos \
  -d your-domain.duckdns.org
```

### Deploy with HTTPS

```bash
cd docker
docker compose -f docker-compose.https.yml up -d --build
```

## 🧪 Testing

### Test Nginx Configs

```bash
# HTTP config
docker run --rm \
  -v $(pwd)/docker/nginx/http/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:1.25-alpine nginx -t

# HTTPS config
docker run --rm \
  -v $(pwd)/docker/nginx/https/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:1.25-alpine nginx -t
```

### Test Docker Compose

```bash
# HTTP
docker compose -f docker/docker-compose.http.yml config

# HTTPS
docker compose -f docker/docker-compose.https.yml config
```

### Test Deployment

```bash
# HTTP
curl http://localhost:3001/health

# HTTPS
curl https://your-domain.duckdns.org/health
```

## 📊 Container Management

### View Logs

```bash
# All services
docker compose -f docker/docker-compose.https.yml logs -f

# Specific service
docker compose -f docker/docker-compose.https.yml logs -f nginx
docker compose -f docker/docker-compose.https.yml logs -f app
docker compose -f docker/docker-compose.https.yml logs -f certbot
```

### Container Status

```bash
docker compose -f docker/docker-compose.https.yml ps
```

### Restart Services

```bash
# Restart all
docker compose -f docker/docker-compose.https.yml restart

# Restart specific service
docker compose -f docker/docker-compose.https.yml restart nginx
```

### Stop/Remove

```bash
# Stop
docker compose -f docker/docker-compose.https.yml stop

# Stop and remove
docker compose -f docker/docker-compose.https.yml down

# Stop, remove, and delete volumes
docker compose -f docker/docker-compose.https.yml down -v
```

## 🔄 Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
cd docker
docker compose -f docker-compose.https.yml up -d --build
```

## 🛠️ Environment Variables

Create a `.env` file in the `docker/` directory:

```env
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# IZITGreen Portal API
IZIT_API_BASE=http://10.20.1.100:8083
IZIT_USERNAME=Vincent
IZIT_PASSWORD=Admin.1024

# Optional: Weather coordinates
# WEATHER_LATITUDE=48.8566
# WEATHER_LONGITUDE=2.3522
# WEATHER_TIMEZONE=Europe/Paris
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker/docker-compose.https.yml logs nginx

# Check if port is in use
sudo netstat -tlnp | grep -E ':(80|443|3001)'

# Remove and rebuild
docker compose -f docker/docker-compose.https.yml down
docker compose -f docker/docker-compose.https.yml up -d --build
```

### SSL Certificate Issues

```bash
# Check certificate
ls -la docker/certbot/conf/live/

# Renew certificate
docker compose -f docker/docker-compose.https.yml run --rm certbot renew

# Force renew
docker compose -f docker/docker-compose.https.yml run --rm certbot renew --force-renewal
```

### Nginx Config Errors

```bash
# Test config syntax
docker compose -f docker/docker-compose.https.yml exec nginx nginx -t

# Reload nginx
docker compose -f docker/docker-compose.https.yml exec nginx nginx -s reload
```

## 💡 Best Practices

1. **Always test configs** before deploying:
   ```bash
   docker compose -f docker-compose.https.yml config
   ```

2. **Use environment variables** for sensitive data:
   - Create `.env` file (never commit it)
   - Reference in docker-compose: `${VARIABLE:-default}`

3. **Monitor logs** regularly:
   ```bash
   docker compose -f docker-compose.https.yml logs -f --tail=100
   ```

4. **Keep images updated**:
   ```bash
   docker compose -f docker-compose.https.yml pull
   docker compose -f docker-compose.https.yml up -d --build
   ```

5. **Backup SSL certificates**:
   ```bash
   tar -czf certbot-backup-$(date +%Y%m%d).tar.gz docker/certbot/conf/
   ```

## 📚 Related Documentation

- [Main README](../README.md)
- [Deployment Workflow](../DEPLOYMENT_WORKFLOW.md)
- [HTTPS Setup Guide](../deployment/HTTPS_DUCKDNS_SETUP.md)
- [Deployment Folder](../deployment/README.md)

## 🎯 Quick Commands Reference

```bash
# Build all images
docker compose -f docker/docker-compose.https.yml build

# Start in background
docker compose -f docker/docker-compose.https.yml up -d

# View logs (real-time)
docker compose -f docker/docker-compose.https.yml logs -f

# Stop all services
docker compose -f docker/docker-compose.https.yml down

# Rebuild and restart
docker compose -f docker/docker-compose.https.yml up -d --build

# Check status
docker compose -f docker/docker-compose.https.yml ps

# Execute command in container
docker compose -f docker/docker-compose.https.yml exec app sh
docker compose -f docker/docker-compose.https.yml exec nginx sh
```

---

**Clean, organized, and production-ready Docker configuration!** 🐳
