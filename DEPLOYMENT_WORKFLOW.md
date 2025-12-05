# Complete Deployment Workflow

**GitHub → Ubuntu → Docker → HTTPS Production**

This document outlines the complete workflow for deploying Page Daveyzieux from GitHub to Ubuntu with Docker and HTTPS.

---

## 📦 What's in the Repository

After pushing to GitHub, your repository contains:

### Core Application
- `server.js` - Express server
- `src/` - Application source code (services, routes, middleware)
- `public/` - Frontend (HTML, CSS, JS, images)
- `package.json` - Node.js dependencies

### Docker Files
- `Dockerfile` - Node.js application image
- `docker-compose.yml` - Standard HTTP deployment
- `docker-compose-https.yml` - **HTTPS production deployment** 🔒

### Nginx Configuration
- `deployment/nginx/nginx.conf` - HTTP reverse proxy
- `deployment/nginx/nginx-ssl.conf` - **HTTPS reverse proxy** 🔒
- `deployment/nginx/Dockerfile.nginx` - HTTP nginx image
- `deployment/nginx/Dockerfile.nginx-ssl` - **HTTPS nginx image** 🔒

### Deployment Scripts
- `deploy-ubuntu.sh` - HTTP deployment (development/testing)
- `deploy-https.sh` - **HTTPS deployment (PRODUCTION)** 🔒

### Documentation
- `README.md` - Project overview
- `UBUNTU_QUICKSTART.md` - Quick start guide
- `DEPLOYMENT_WORKFLOW.md` - This file
- `deployment/HTTPS_DUCKDNS_SETUP.md` - Detailed HTTPS guide
- `docs/` - Complete documentation

---

## 🚀 Deployment Options

You have **TWO deployment options**:

### Option 1: HTTP Deployment (Testing/Development)

**When to use:**
- Local network testing
- Development environment
- Behind another reverse proxy

**Command:**
```bash
./deploy-ubuntu.sh
```

**Access:**
- http://localhost:3001
- http://YOUR_SERVER_IP:3001

---

### Option 2: HTTPS Deployment (Production) ⭐ RECOMMENDED

**When to use:**
- Production environment
- Public internet access
- Need SSL/TLS encryption
- Using DuckDNS domain

**Command:**
```bash
./deploy-https.sh
```

**Access:**
- https://your-domain.duckdns.org

**Features:**
- ✅ Free SSL certificate (Let's Encrypt)
- ✅ Auto-renewal every 12 hours
- ✅ HTTP → HTTPS redirect
- ✅ Modern TLS 1.2/1.3
- ✅ Security headers (HSTS, etc.)
- ✅ DuckDNS auto-update

---

## 📋 Complete HTTPS Deployment Guide

### Prerequisites

Before you start:

1. **DuckDNS Account**
   - Go to [duckdns.org](https://www.duckdns.org)
   - Sign in and create domain (e.g., `page-daveyzieux`)
   - Note your token

2. **Ubuntu Server**
   - Ubuntu 20.04+ or Debian 11+
   - Root or sudo access
   - Internet connection

3. **Network Configuration**
   - Port 80 open (for certbot challenges)
   - Port 443 open (for HTTPS traffic)
   - Router port forwarding configured (if behind NAT)

### Step-by-Step HTTPS Deployment

#### 1. Clone Repository on Ubuntu

```bash
# Clone from GitHub
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux
```

#### 2. Make Script Executable

```bash
chmod +x deploy-https.sh
```

#### 3. Run HTTPS Deployment

```bash
./deploy-https.sh
```

The script will:
1. ✅ Ask for your DuckDNS domain and token
2. ✅ Ask for your email (for Let's Encrypt)
3. ✅ Update DuckDNS with your server IP
4. ✅ Install Docker and Docker Compose (if needed)
5. ✅ Create necessary directories
6. ✅ Configure nginx with your domain
7. ✅ Obtain SSL certificate from Let's Encrypt
8. ✅ Build Docker images
9. ✅ Start all containers with HTTPS
10. ✅ Configure firewall (UFW)
11. ✅ Test deployment
12. ✅ Set up DuckDNS auto-update cron job

#### 4. Access Your Site

```bash
# Open in browser
https://your-domain.duckdns.org
```

---

## 🔧 Post-Deployment Management

### View Logs

```bash
# All services
docker compose -f docker-compose-https.yml logs -f

# Just nginx
docker compose -f docker-compose-https.yml logs -f nginx

# Just the app
docker compose -f docker-compose-https.yml logs -f weather-dashboard

# Certbot (certificate renewal)
docker compose -f docker-compose-https.yml logs -f certbot
```

### Control Services

```bash
# Stop everything
docker compose -f docker-compose-https.yml down

# Start everything
docker compose -f docker-compose-https.yml up -d

# Restart a service
docker compose -f docker-compose-https.yml restart nginx

# Check status
docker compose -f docker-compose-https.yml ps
```

### Update Application

When you push changes to GitHub:

```bash
# On Ubuntu server
cd Page_Daveyzieux
git pull
docker compose -f docker-compose-https.yml up -d --build

# Verify
curl https://your-domain.duckdns.org/health
```

### Check SSL Certificate

```bash
# Certificate expiry
sudo openssl x509 -in deployment/certbot/conf/live/YOUR_DOMAIN/fullchain.pem -noout -dates

# Test SSL
openssl s_client -connect your-domain.duckdns.org:443 -servername your-domain.duckdns.org

# Check auto-renewal
docker compose -f docker-compose-https.yml logs certbot
```

### Check DuckDNS Updates

```bash
# View cron job
crontab -l | grep duckdns

# Manual update
curl "https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip="
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose-https.yml logs

# Check if ports are in use
sudo netstat -tlnp | grep -E ':(80|443)'

# Remove and rebuild
docker compose -f docker-compose-https.yml down -v
docker compose -f docker-compose-https.yml up -d --build
```

### SSL Certificate Issues

```bash
# Renew manually
docker compose -f docker-compose-https.yml run --rm certbot renew

# Get new certificate
docker run --rm \
  -v $(pwd)/deployment/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/deployment/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d your-domain.duckdns.org
```

### DuckDNS Not Working

```bash
# Test update
curl "https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip="

# Should return: OK

# Check current IP
curl https://www.duckdns.org/current

# Verify domain points to your server
nslookup your-domain.duckdns.org
```

### Can't Access Site

```bash
# 1. Check containers are running
docker compose -f docker-compose-https.yml ps

# 2. Check firewall
sudo ufw status

# 3. Test locally
curl http://localhost/health
curl https://localhost/health -k

# 4. Check nginx config
docker compose -f docker-compose-https.yml exec nginx nginx -t

# 5. Check logs
docker compose -f docker-compose-https.yml logs nginx
```

---

## 📊 Architecture Overview

### Production HTTPS Stack

```
Internet (Port 443)
         ↓
    [Firewall/Router]
         ↓
    [Ubuntu Server]
         ↓
    [Docker Network: app-network]
         ↓
┌────────────────────────────────┐
│  Nginx (Container)             │
│  - Port 80 → Redirect to 443   │
│  - Port 443 → Proxy to Node.js │
│  - SSL/TLS termination         │
│  - Rate limiting               │
│  - Compression                 │
└────────┬───────────────────────┘
         ↓
┌────────────────────────────────┐
│  Node.js App (Container)       │
│  - Express server              │
│  - API endpoints               │
│  - Serves static files         │
│  - Port 3001 (internal)        │
└────────────────────────────────┘

┌────────────────────────────────┐
│  Certbot (Container)           │
│  - Auto-renew certificates     │
│  - Runs every 12 hours         │
└────────────────────────────────┘
```

---

## 📁 Directory Structure After Deployment

```
Page_Daveyzieux/
├── deployment/
│   ├── certbot/
│   │   ├── conf/           # SSL certificates (Let's Encrypt)
│   │   └── www/            # Certbot challenges
│   ├── nginx/
│   │   ├── nginx-ssl.conf  # HTTPS nginx config
│   │   └── Dockerfile.nginx-ssl
│   └── HTTPS_DUCKDNS_SETUP.md
├── docker-compose-https.yml  # HTTPS deployment
├── deploy-https.sh           # HTTPS deployment script
├── Dockerfile
├── server.js
├── src/
├── public/
└── docs/
```

---

## ✅ Production Deployment Checklist

Before going live:

- [ ] DuckDNS domain configured and working
- [ ] Ports 80 and 443 forwarded to Ubuntu server
- [ ] Firewall configured (UFW allows 80, 443)
- [ ] SSL certificate obtained successfully
- [ ] HTTPS site accessible from internet
- [ ] HTTP redirects to HTTPS
- [ ] All API endpoints working
- [ ] Environment variables configured (.env)
- [ ] DuckDNS auto-update cron job active
- [ ] Certbot auto-renewal configured
- [ ] Monitoring/logs reviewed
- [ ] Backup plan in place

---

## 🔄 Development Workflow

### Local Development (Windows)

```bash
# Edit code locally
npm install
npm start

# Test at http://localhost:3001
```

### Push to GitHub

```bash
git add .
git commit -m "Your changes"
git push
```

### Deploy to Ubuntu

```bash
# SSH to Ubuntu server
ssh user@your-server

# Pull latest changes
cd Page_Daveyzieux
git pull

# Rebuild and restart
docker compose -f docker-compose-https.yml up -d --build
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [DuckDNS Documentation](https://www.duckdns.org/spec.jsp)
- [Certbot Documentation](https://eff-certbot.readthedocs.io/)

### Project Documentation

- [README.md](README.md) - Project overview and features
- [UBUNTU_QUICKSTART.md](UBUNTU_QUICKSTART.md) - Quick start guide
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Detailed deployment guide
- [docs/CODE-DOCUMENTATION.md](docs/CODE-DOCUMENTATION.md) - Code documentation
- [deployment/HTTPS_DUCKDNS_SETUP.md](deployment/HTTPS_DUCKDNS_SETUP.md) - HTTPS setup guide

---

## 🎯 Quick Reference

### One-Command HTTPS Deployment

```bash
git clone https://github.com/Nath333/Page_Daveyzieux.git && \
cd Page_Daveyzieux && \
chmod +x deploy-https.sh && \
./deploy-https.sh
```

### Essential Commands

```bash
# View logs
docker compose -f docker-compose-https.yml logs -f

# Restart
docker compose -f docker-compose-https.yml restart

# Update
git pull && docker compose -f docker-compose-https.yml up -d --build

# Stop
docker compose -f docker-compose-https.yml down

# Check health
curl https://your-domain.duckdns.org/health
```

---

## 💡 Tips

1. **Always test locally first** before deploying to production
2. **Monitor logs regularly**: `docker compose logs -f`
3. **Keep .env secure**: Never commit credentials
4. **Update regularly**: `git pull` and rebuild
5. **Backup certificates**: `deployment/certbot/conf/`
6. **Check DuckDNS**: Verify cron job is running
7. **Test SSL**: Use [SSL Labs](https://www.ssllabs.com/ssltest/) to check configuration

---

## 🎉 Success!

Your Page Daveyzieux application is now:

✅ **Pushed to GitHub** - https://github.com/Nath333/Page_Daveyzieux
✅ **Docker-ready** - Complete Docker Compose setup
✅ **HTTPS-enabled** - SSL/TLS with Let's Encrypt
✅ **Auto-renewing** - Certbot handles certificate renewal
✅ **DuckDNS-integrated** - Free domain with auto-update
✅ **Production-ready** - Nginx reverse proxy with security headers

**Your deployment workflow:**

1. Code changes → Push to GitHub
2. SSH to Ubuntu → `git pull`
3. `docker compose -f docker-compose-https.yml up -d --build`
4. Done! 🚀

---

**Need Help?**

Check logs first: `docker compose -f docker-compose-https.yml logs -f`

For detailed guides, see:
- [UBUNTU_QUICKSTART.md](UBUNTU_QUICKSTART.md)
- [deployment/HTTPS_DUCKDNS_SETUP.md](deployment/HTTPS_DUCKDNS_SETUP.md)
