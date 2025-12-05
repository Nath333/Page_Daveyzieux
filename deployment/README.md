# Deployment Scripts & Tools

Automated deployment scripts and configuration tools for Page Daveyzieux.

---

## 📁 Folder Structure

```
deployment/
├── deploy-https.sh              # HTTPS production deployment ⭐
├── deploy-ubuntu.sh             # HTTP development deployment
├── configure-domain.sh          # Configure DuckDNS domain
├── verify-configs.sh            # Verify all configurations
├── HTTPS_DUCKDNS_SETUP.md      # Detailed HTTPS guide
└── README.md                    # This file
```

---

## 🚀 Deployment Scripts

### deploy-https.sh ⭐ (Production)

**Purpose**: Automated HTTPS deployment with DuckDNS and Let's Encrypt

**What it does**:
1. ✅ Asks for DuckDNS domain and token
2. ✅ Updates DuckDNS with server IP
3. ✅ Installs Docker (if needed)
4. ✅ Configures nginx with your domain
5. ✅ Obtains SSL certificate
6. ✅ Builds and starts all containers
7. ✅ Configures firewall
8. ✅ Sets up auto-renewal
9. ✅ Tests deployment

**Usage**:
```bash
./deployment/deploy-https.sh
```

**Requirements**:
- Ubuntu 20.04+ or Debian 11+
- DuckDNS account and domain
- Ports 80 and 443 open

**Result**: HTTPS site at https://your-domain.duckdns.org

---

### deploy-ubuntu.sh (Development)

**Purpose**: Quick HTTP deployment for development/testing

**What it does**:
1. ✅ Installs Docker (if needed)
2. ✅ Stops existing containers
3. ✅ Builds Docker images
4. ✅ Starts HTTP deployment
5. ✅ Tests endpoints

**Usage**:
```bash
./deployment/deploy-ubuntu.sh
```

**Requirements**:
- Ubuntu 20.04+ or Debian 11+

**Result**: HTTP site at http://localhost:3001

---

## 🔧 Configuration Tools

### configure-domain.sh

**Purpose**: Configure your DuckDNS domain in nginx config

**What it does**:
- Updates `docker/nginx/https/nginx.conf` with your domain
- Creates backup of original config
- Shows what was changed

**Usage**:
```bash
./deployment/configure-domain.sh
```

**Prompts for**:
- Your DuckDNS domain (without .duckdns.org)

**Example**:
```bash
$ ./deployment/configure-domain.sh
Enter your DuckDNS domain: page-daveyzieux
✓ Updated nginx config with page-daveyzieux.duckdns.org
```

---

### verify-configs.sh

**Purpose**: Test all Docker and nginx configurations

**What it does**:
1. ✅ Checks Docker installation
2. ✅ Tests HTTP nginx config syntax
3. ✅ Tests HTTPS nginx config syntax
4. ✅ Validates docker-compose.http.yml
5. ✅ Validates docker-compose.https.yml
6. ✅ Checks all required files exist

**Usage**:
```bash
./deployment/verify-configs.sh
```

**Output**:
```
✓ Docker is installed
✓ HTTP nginx config is valid
✓ HTTPS nginx config is valid
✓ docker-compose.http.yml is valid
✓ docker-compose.https.yml is valid
✓ All configurations valid!
```

---

## 📖 Quick Start

### Deployment Methods

#### Method 1: Git Push & Pull (Recommended) ⭐

**Best for**: Regular updates, fastest workflow

**On Your Local Machine (Windows):**
```bash
git add .
git commit -m "Update application"
git push origin main
```

**On Your Ubuntu Server:**
```bash
cd Page_Daveyzieux
git pull origin main
cd docker
docker compose -f docker-compose.https.yml down
docker compose -f docker-compose.https.yml up -d --build
```

**Why this method?**
- ✅ Fastest - no image registry needed
- ✅ Simple - push code and rebuild on server
- ✅ Always up-to-date with latest source

---

#### Method 2: First Time Deployment

**For production (HTTPS)**:
```bash
# 1. Clone repository
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux

# 2. Run HTTPS deployment
./deployment/deploy-https.sh

# The script will guide you through:
# - DuckDNS domain setup
# - SSL certificate
# - Docker deployment
```

**For development (HTTP)**:
```bash
# 1. Clone repository
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux

# 2. Run HTTP deployment
./deployment/deploy-ubuntu.sh
```

---

#### Method 3: Pre-built Images from GHCR (Advanced)

**Best for**: Production environments, no build time on server

```bash
cd Page_Daveyzieux/docker
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

See [../docker/GHCR.md](../docker/GHCR.md) for complete guide.

---

## 🧪 Testing Before Deployment

```bash
# Verify all configs are valid
./deployment/verify-configs.sh

# Test nginx config only
docker run --rm \
  -v $(pwd)/docker/nginx/https/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:1.25-alpine nginx -t
```

---

## 📝 Environment Variables

The deployment scripts use environment variables from `.env` file or command line.

**Create `.env` in project root**:
```env
# IZITGreen Portal
IZIT_API_BASE=http://10.20.1.100:8083
IZIT_USERNAME=Vincent
IZIT_PASSWORD=Admin.1024

# Server
PORT=3001
NODE_ENV=production
```

---

## 🔐 HTTPS Deployment Details

### What deploy-https.sh Does

1. **DuckDNS Setup**
   - Updates your domain to point to server IP
   - Sets up cron job for auto-update (every 5 min)

2. **SSL Certificate**
   - Obtains free certificate from Let's Encrypt
   - Valid for 90 days
   - Auto-renewal configured (every 12 hours)

3. **Nginx Configuration**
   - Updates `docker/nginx/https/nginx.conf` with your domain
   - Configures SSL/TLS settings
   - Sets up HTTP → HTTPS redirect

4. **Docker Deployment**
   - Builds optimized images
   - Starts nginx + Node.js + Certbot
   - Configures health checks

5. **Security**
   - Configures firewall (UFW)
   - Sets up security headers
   - Enables HSTS

### Files Modified

- `docker/nginx/https/nginx.conf` - Domain configuration
- `docker/certbot/conf/` - SSL certificates
- Crontab - DuckDNS auto-update

### Ports Configured

- Port 80 - HTTP (redirect to HTTPS + certbot)
- Port 443 - HTTPS

---

## 🐛 Troubleshooting

### Script Fails to Get SSL Certificate

**Check**:
```bash
# 1. Verify port 80 is open
sudo netstat -tlnp | grep :80

# 2. Test DuckDNS
curl "https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip="

# 3. Check DNS
nslookup your-domain.duckdns.org
```

### Docker Not Found

```bash
# Install Docker manually
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in
```

### Permission Denied

```bash
# Make scripts executable
chmod +x deployment/*.sh
```

---

## 📚 Related Documentation

- [HTTPS Setup Guide](HTTPS_DUCKDNS_SETUP.md) - Detailed HTTPS instructions
- [Docker Guide](../docker/README.md) - Docker configuration details
- [Deployment Workflow](../DEPLOYMENT_WORKFLOW.md) - Complete workflow
- [Quick Start](../QUICKSTART.md) - Fast deployment guide

---

## 💡 Best Practices

1. **Always test first**
   ```bash
   ./deployment/verify-configs.sh
   ```

2. **Use HTTPS in production**
   ```bash
   ./deployment/deploy-https.sh
   ```

3. **Keep credentials secure**
   - Use `.env` file
   - Never commit credentials

4. **Monitor logs**
   ```bash
   cd docker
   docker compose -f docker-compose.https.yml logs -f
   ```

5. **Update regularly**
   ```bash
   git pull && ./deployment/deploy-https.sh
   ```

---

## 🎯 Quick Commands Reference

```bash
# Deploy HTTPS (production)
./deployment/deploy-https.sh

# Deploy HTTP (development)
./deployment/deploy-ubuntu.sh

# Configure domain
./deployment/configure-domain.sh

# Verify configs
./deployment/verify-configs.sh

# View logs
cd docker && docker compose -f docker-compose.https.yml logs -f

# Stop deployment
cd docker && docker compose -f docker-compose.https.yml down

# Update deployment
git pull && cd docker && docker compose -f docker-compose.https.yml up -d --build
```

---

**Clean, organized, and production-ready deployment scripts!** 🚀
