# HTTPS with DuckDNS Setup Guide

Complete guide to add HTTPS support using DuckDNS and Let's Encrypt SSL certificates.

## 📋 Prerequisites

- Ubuntu server with Docker installed
- DuckDNS account (free at [duckdns.org](https://www.duckdns.org))
- Domain name from DuckDNS (e.g., `yourdomain.duckdns.org`)
- Port 80 and 443 accessible from the internet

## 🔧 Step-by-Step Setup

### Step 1: Get Your DuckDNS Domain

1. Go to [duckdns.org](https://www.duckdns.org)
2. Sign in (GitHub, Google, etc.)
3. Create a subdomain (e.g., `page-daveyzieux`)
4. Note your **token** and **domain name**

Your domain will be: `page-daveyzieux.duckdns.org`

### Step 2: Update DuckDNS IP

```bash
# Set your DuckDNS token and domain
DUCKDNS_TOKEN="your-token-here"
DUCKDNS_DOMAIN="page-daveyzieux"

# Update your IP (run this on your Ubuntu server)
curl "https://www.duckdns.org/update?domains=$DUCKDNS_DOMAIN&token=$DUCKDNS_TOKEN&ip="

# Should return: OK
```

### Step 3: Create SSL Certificate Directory

```bash
cd ~/Page_Daveyzieux
mkdir -p deployment/certbot/conf
mkdir -p deployment/certbot/www
mkdir -p deployment/nginx-ssl
```

### Step 4: Create HTTPS-Enabled Nginx Configuration

Create `deployment/nginx-ssl/nginx-ssl.conf`:

```nginx
# Nginx configuration with HTTPS support
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

    # Upstream backend
    upstream nodejs_backend {
        server weather-dashboard:3001;
        keepalive 64;
    }

    # HTTP server - redirect to HTTPS
    server {
        listen 80;
        listen [::]:80;
        server_name _;

        # Allow certbot validation
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name page-daveyzieux.duckdns.org;  # Change this to your domain

        # SSL certificates
        ssl_certificate /etc/letsencrypt/live/page-daveyzieux.duckdns.org/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/page-daveyzieux.duckdns.org/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://nodejs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files and HTML
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            proxy_pass http://nodejs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Step 5: Create Docker Compose with HTTPS

Create `docker-compose-ssl.yml`:

```yaml
version: '3.8'

services:
  # Certbot for SSL certificates
  certbot:
    image: certbot/certbot:latest
    container_name: certbot
    volumes:
      - ./deployment/certbot/conf:/etc/letsencrypt
      - ./deployment/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - app-network

  # Nginx with HTTPS
  nginx:
    image: nginx:1.25-alpine
    container_name: smart-building-nginx-ssl
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx-ssl/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - ./deployment/certbot/conf:/etc/letsencrypt:ro
      - ./deployment/certbot/www:/var/www/certbot:ro
    depends_on:
      weather-dashboard:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network

  # Node.js application
  weather-dashboard:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: smart-building-weather
    expose:
      - "3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - HOST=0.0.0.0
      - IZIT_API_BASE=http://10.20.1.100:8083
      - IZIT_USERNAME=Vincent
      - IZIT_PASSWORD=Admin.1024
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/api/weather', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      start_period: 5s
      retries: 3
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Step 6: Get SSL Certificate

```bash
# Replace with your domain and email
DOMAIN="page-daveyzieux.duckdns.org"
EMAIL="your-email@example.com"

# Start nginx temporarily for certbot
docker compose -f docker-compose-ssl.yml up -d nginx

# Get certificate
docker run -it --rm \
  -v $(pwd)/deployment/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/deployment/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

# Stop temporary nginx
docker compose -f docker-compose-ssl.yml down
```

### Step 7: Update Nginx Configuration with Your Domain

```bash
# Edit the nginx-ssl.conf file
nano deployment/nginx-ssl/nginx-ssl.conf

# Update these lines with YOUR domain:
# Line 57: server_name page-daveyzieux.duckdns.org;  # Change this
# Line 60: ssl_certificate /etc/letsencrypt/live/YOUR-DOMAIN/fullchain.pem;
# Line 61: ssl_certificate_key /etc/letsencrypt/live/YOUR-DOMAIN/privkey.pem;
```

### Step 8: Deploy with HTTPS

```bash
# Start all services with HTTPS
docker compose -f docker-compose-ssl.yml up -d --build

# Check status
docker compose -f docker-compose-ssl.yml ps

# Check logs
docker compose -f docker-compose-ssl.yml logs -f nginx
```

### Step 9: Configure Firewall

```bash
# Allow HTTPS traffic
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp  # Keep for certificate renewal
sudo ufw status
```

### Step 10: Test HTTPS

```bash
# Test locally
curl https://page-daveyzieux.duckdns.org/health

# Check SSL certificate
openssl s_client -connect page-daveyzieux.duckdns.org:443 -servername page-daveyzieux.duckdns.org
```

## 🔄 Automatic Certificate Renewal

Certbot container automatically renews certificates every 12 hours. No manual intervention needed!

## 🐛 Troubleshooting

### Certificate Not Found

```bash
# Check certificate files
sudo ls -la deployment/certbot/conf/live/

# If empty, re-run certbot:
docker run -it --rm \
  -v $(pwd)/deployment/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/deployment/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d your-domain.duckdns.org
```

### Nginx Won't Start

```bash
# Check nginx configuration syntax
docker run --rm \
  -v $(pwd)/deployment/nginx-ssl/nginx-ssl.conf:/etc/nginx/nginx.conf:ro \
  nginx:1.25-alpine \
  nginx -t

# Check logs
docker compose -f docker-compose-ssl.yml logs nginx
```

### DuckDNS Not Updating

```bash
# Test DuckDNS update
curl "https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip="

# Set up auto-update with cron
crontab -e

# Add this line (update every 5 minutes):
*/5 * * * * curl -s "https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip=" > /dev/null
```

### Port 80/443 Not Accessible

```bash
# Check if ports are open
sudo netstat -tlnp | grep -E ':(80|443)'

# Check firewall
sudo ufw status

# Check router port forwarding
# You need to forward ports 80 and 443 to your Ubuntu server
```

## 📝 Complete Deployment Script with HTTPS

Create `deploy-ubuntu-https.sh`:

```bash
#!/bin/bash
set -e

echo "========================================="
echo "Page Daveyzieux - HTTPS Deployment"
echo "========================================="

# Variables
read -p "Enter your DuckDNS domain (e.g., page-daveyzieux): " DUCKDNS_DOMAIN
read -p "Enter your email for Let's Encrypt: " EMAIL
read -p "Enter your DuckDNS token: " DUCKDNS_TOKEN

FULL_DOMAIN="${DUCKDNS_DOMAIN}.duckdns.org"

# Update DuckDNS
echo "Updating DuckDNS..."
curl -s "https://www.duckdns.org/update?domains=$DUCKDNS_DOMAIN&token=$DUCKDNS_TOKEN&ip="

# Create directories
mkdir -p deployment/certbot/conf
mkdir -p deployment/certbot/www
mkdir -p deployment/nginx-ssl

# Update nginx config with domain
sed -i "s/page-daveyzieux.duckdns.org/$FULL_DOMAIN/g" deployment/nginx-ssl/nginx-ssl.conf

# Get certificate
echo "Getting SSL certificate..."
docker run -it --rm \
  -v $(pwd)/deployment/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/deployment/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $FULL_DOMAIN

# Deploy
echo "Deploying with HTTPS..."
docker compose -f docker-compose-ssl.yml up -d --build

echo ""
echo "========================================="
echo "HTTPS Deployment Complete!"
echo "========================================="
echo ""
echo "Your site: https://$FULL_DOMAIN"
echo ""
```

## ✅ Final Checklist

- [ ] DuckDNS account created
- [ ] Domain configured (e.g., `page-daveyzieux.duckdns.org`)
- [ ] Ports 80 and 443 forwarded in router
- [ ] Firewall allows ports 80 and 443
- [ ] SSL certificate obtained
- [ ] nginx-ssl.conf updated with your domain
- [ ] docker-compose-ssl.yml deployed
- [ ] Site accessible via HTTPS

## 📚 Additional Resources

- [DuckDNS Documentation](https://www.duckdns.org/spec.jsp)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://eff-certbot.readthedocs.io/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

---

**Need help?** Check logs: `docker compose -f docker-compose-ssl.yml logs -f`
