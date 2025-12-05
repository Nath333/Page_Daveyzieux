# Deployment Configuration

This folder contains all Docker and Nginx configurations for deploying Page Daveyzieux.

## 📁 Folder Structure

```
deployment/
├── nginx/
│   ├── Dockerfile.nginx         # HTTP-only nginx image
│   ├── Dockerfile.nginx-ssl     # HTTPS nginx image (with SSL support)
│   ├── nginx.conf               # HTTP nginx configuration
│   └── nginx-ssl.conf           # HTTPS nginx configuration (template)
├── certbot/                     # Created at runtime
│   ├── conf/                    # SSL certificates (Let's Encrypt)
│   └── www/                     # Certbot challenges
├── HTTPS_DUCKDNS_SETUP.md      # Detailed HTTPS setup guide
└── README.md                    # This file
```

## 🚀 Deployment Options

### Option 1: HTTP Deployment (Development/Testing)

**Files used:**
- `docker-compose.yml` (root)
- `deployment/nginx/Dockerfile.nginx`
- `deployment/nginx/nginx.conf`
- `Dockerfile` (Node.js app)

**Deploy:**
```bash
docker compose up -d --build
```

**Access:**
- http://localhost:3001

---

### Option 2: HTTPS Deployment (Production) ⭐

**Files used:**
- `docker-compose-https.yml` (root)
- `deployment/nginx/Dockerfile.nginx-ssl`
- `deployment/nginx/nginx-ssl.conf` (needs domain configuration)
- `Dockerfile` (Node.js app)
- Certbot (automatic)

**Deploy:**
```bash
./deploy-https.sh
```

**Access:**
- https://your-domain.duckdns.org

---

## 🔧 Configuration Files Explained

### Nginx Dockerfiles

#### `Dockerfile.nginx` (HTTP only)
- Based on `nginx:1.25-alpine`
- Installs `wget` for health checks
- Copies `nginx.conf`
- Exposes port 80
- **Use for:** Development, testing, internal networks

#### `Dockerfile.nginx-ssl` (HTTPS)
- Based on `nginx:1.25-alpine`
- Installs `wget` and `openssl`
- Copies `nginx-ssl.conf`
- Exposes ports 80 and 443
- Mounts SSL certificates from certbot
- **Use for:** Production with DuckDNS and Let's Encrypt

### Nginx Configurations

#### `nginx.conf` (HTTP)
- Port 80 only
- Reverse proxy to Node.js app (port 3001)
- Rate limiting (10 req/s API, 30 req/s general)
- Gzip compression
- Security headers
- Static file caching
- Cloudflare IP support
- **No SSL/TLS**

#### `nginx-ssl.conf` (HTTPS)
- Ports 80 (redirect) and 443 (HTTPS)
- SSL/TLS with Let's Encrypt certificates
- HTTP → HTTPS redirect
- Modern TLS 1.2/1.3 configuration
- Security headers (HSTS, etc.)
- Certbot challenge support
- **Template:** Replace `YOUR_DOMAIN.duckdns.org` with your actual domain

---

## ⚙️ How It Works

### HTTP Deployment Flow

```
Client (Port 3001)
    ↓
Docker Host
    ↓
Nginx Container (Port 80 → 3001)
    ↓
Node.js Container (Port 3001)
```

### HTTPS Deployment Flow

```
Client (Port 443)
    ↓
Docker Host
    ↓
Nginx Container (Port 443 → 3001)
    ├── SSL/TLS Termination
    ├── HTTP→HTTPS Redirect (Port 80)
    └── Certbot Challenges
    ↓
Node.js Container (Port 3001)

Certbot Container
    ├── Auto-renew certificates
    └── Update every 12 hours
```

---

## 🔒 SSL Certificate Management

### Automatic (Recommended)

Use `deploy-https.sh` script:
```bash
./deploy-https.sh
```

This will:
1. Ask for your DuckDNS domain
2. Obtain SSL certificate from Let's Encrypt
3. Configure nginx with your domain
4. Set up auto-renewal

### Manual

1. **Create directories:**
```bash
mkdir -p deployment/certbot/conf
mkdir -p deployment/certbot/www
```

2. **Update nginx-ssl.conf:**
```bash
# Replace YOUR_DOMAIN.duckdns.org with your actual domain
sed -i 's/YOUR_DOMAIN.duckdns.org/your-domain.duckdns.org/g' deployment/nginx/nginx-ssl.conf
```

3. **Get certificate:**
```bash
docker run --rm \
  -v $(pwd)/deployment/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/deployment/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email your-email@example.com \
  --agree-tos \
  -d your-domain.duckdns.org
```

4. **Deploy:**
```bash
docker compose -f docker-compose-https.yml up -d --build
```

---

## 📝 Before First HTTPS Deployment

### 1. Configure DuckDNS Domain

Edit `deployment/nginx/nginx-ssl.conf`:

```nginx
# Line 89: Change this
server_name YOUR_DOMAIN.duckdns.org;  # <-- Replace with your domain

# Lines 92-93: Update certificate paths
ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN.duckdns.org/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN.duckdns.org/privkey.pem;

# Line 105: Update trusted certificate
ssl_trusted_certificate /etc/letsencrypt/live/YOUR_DOMAIN.duckdns.org/chain.pem;
```

**Or use the automated script:**
```bash
DOMAIN="your-domain.duckdns.org"
sed -i "s/YOUR_DOMAIN.duckdns.org/$DOMAIN/g" deployment/nginx/nginx-ssl.conf
```

### 2. Open Firewall Ports

```bash
sudo ufw allow 80/tcp   # HTTP (certbot challenges)
sudo ufw allow 443/tcp  # HTTPS
```

### 3. Verify DuckDNS

```bash
# Update DuckDNS IP
curl "https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip="

# Check DNS
nslookup your-domain.duckdns.org
```

---

## 🧪 Testing Configurations

### Test Nginx Config Syntax

**HTTP:**
```bash
docker run --rm \
  -v $(pwd)/deployment/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:1.25-alpine \
  nginx -t
```

**HTTPS:**
```bash
docker run --rm \
  -v $(pwd)/deployment/nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro \
  nginx:1.25-alpine \
  nginx -t
```

### Test Deployment

**HTTP:**
```bash
docker compose up -d --build
curl http://localhost:3001/health
```

**HTTPS:**
```bash
docker compose -f docker-compose-https.yml up -d --build
curl https://your-domain.duckdns.org/health
```

---

## 🔄 Switching Between HTTP and HTTPS

### From HTTP to HTTPS

```bash
# Stop HTTP deployment
docker compose down

# Deploy with HTTPS
./deploy-https.sh
```

### From HTTPS to HTTP

```bash
# Stop HTTPS deployment
docker compose -f docker-compose-https.yml down

# Deploy with HTTP
docker compose up -d --build
```

---

## 🐛 Troubleshooting

### Nginx Won't Start

```bash
# Check nginx config syntax
docker compose exec nginx nginx -t

# Check logs
docker compose logs nginx

# Rebuild
docker compose down
docker compose up -d --build
```

### SSL Certificate Issues

```bash
# Check certificate files
ls -la deployment/certbot/conf/live/

# Renew certificate
docker compose -f docker-compose-https.yml run --rm certbot renew

# Get new certificate
docker run --rm \
  -v $(pwd)/deployment/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/deployment/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d your-domain.duckdns.org
```

### Port Already in Use

```bash
# Check what's using the port
sudo netstat -tlnp | grep -E ':(80|443|3001)'

# Stop conflicting service
sudo systemctl stop apache2  # or nginx, etc.
```

---

## 📚 Related Files

### Root Directory
- `Dockerfile` - Node.js application image
- `docker-compose.yml` - HTTP deployment
- `docker-compose-https.yml` - HTTPS deployment
- `deploy-ubuntu.sh` - HTTP deployment script
- `deploy-https.sh` - HTTPS deployment script

### Documentation
- `DEPLOYMENT_WORKFLOW.md` - Complete deployment guide
- `UBUNTU_QUICKSTART.md` - Quick start guide
- `deployment/HTTPS_DUCKDNS_SETUP.md` - Detailed HTTPS guide

---

## ✅ Clean Deployment Checklist

### HTTP Deployment
- [ ] Node.js app builds successfully (`Dockerfile`)
- [ ] Nginx builds successfully (`deployment/nginx/Dockerfile.nginx`)
- [ ] Nginx config valid (`deployment/nginx/nginx.conf`)
- [ ] Port 3001 available
- [ ] Docker Compose up successfully
- [ ] Health check passes: `curl http://localhost:3001/health`

### HTTPS Deployment
- [ ] DuckDNS domain configured
- [ ] Domain points to server IP
- [ ] Ports 80 and 443 available
- [ ] `nginx-ssl.conf` updated with domain
- [ ] SSL certificate obtained
- [ ] Nginx builds successfully (`deployment/nginx/Dockerfile.nginx-ssl`)
- [ ] Docker Compose HTTPS up successfully
- [ ] Health check passes: `curl https://your-domain.duckdns.org/health`
- [ ] SSL certificate valid: `openssl s_client -connect your-domain.duckdns.org:443`

---

## 💡 Best Practices

1. **Always test locally first** with HTTP deployment
2. **Use environment variables** for sensitive data (`.env` file)
3. **Keep certificates backed up** (`deployment/certbot/conf/`)
4. **Monitor logs regularly** (`docker compose logs -f`)
5. **Update regularly** (`git pull && docker compose up -d --build`)
6. **Use HTTPS in production** (deploy-https.sh)
7. **Test nginx config** before deploying (`nginx -t`)

---

## 🎯 Quick Commands Reference

```bash
# HTTP Deployment
docker compose up -d --build
docker compose logs -f
docker compose down

# HTTPS Deployment
docker compose -f docker-compose-https.yml up -d --build
docker compose -f docker-compose-https.yml logs -f
docker compose -f docker-compose-https.yml down

# Test nginx config
docker compose exec nginx nginx -t

# Renew SSL certificate
docker compose -f docker-compose-https.yml run --rm certbot renew

# View certificate info
openssl x509 -in deployment/certbot/conf/live/YOUR_DOMAIN/fullchain.pem -noout -text
```

---

**For detailed deployment instructions, see:**
- [DEPLOYMENT_WORKFLOW.md](../DEPLOYMENT_WORKFLOW.md)
- [HTTPS_DUCKDNS_SETUP.md](HTTPS_DUCKDNS_SETUP.md)
