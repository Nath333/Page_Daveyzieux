# Quick Start Guide

**Page Daveyzieux** - Fast deployment on Ubuntu with Docker

---

## 🚀 Deployment Methods

### Method 1: Git Push & Pull (Fastest - Recommended) ⭐

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
- ✅ Simple - just push code and rebuild
- ✅ Always up-to-date with latest code

---

### Method 2: Pre-built Images from GHCR (Advanced)

**On Your Ubuntu Server:**
```bash
cd Page_Daveyzieux/docker
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

See [docker/GHCR.md](docker/GHCR.md) for complete guide.

---

### Method 3: First Time Setup (HTTPS with Let's Encrypt)

```bash
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux
./deployment/deploy-https.sh
```

**Access**: https://your-domain.duckdns.org

---

### Method 4: HTTP Testing (Development)

```bash
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux
./deployment/deploy-ubuntu.sh
```

**Access**: http://localhost:3001

---

## 📁 Project Structure

```
Page_Daveyzieux/
├── docker/                          # All Docker files
│   ├── app/Dockerfile               # Node.js image
│   ├── nginx/                       # Nginx configs
│   ├── docker-compose.http.yml      # HTTP deployment
│   └── docker-compose.https.yml     # HTTPS deployment
│
├── deployment/                      # Deployment scripts
│   ├── deploy-https.sh              # HTTPS deployment ⭐
│   ├── deploy-ubuntu.sh             # HTTP deployment
│   ├── configure-domain.sh          # Domain setup
│   └── verify-configs.sh            # Test configs
│
├── src/                             # Application code
├── public/                          # Frontend files
└── docs/                            # Documentation
```

---

## 🔧 Manual Deployment

### HTTP Deployment

```bash
cd docker
docker compose -f docker-compose.http.yml up -d --build
```

### HTTPS Deployment

```bash
# Configure domain first
cd deployment
./configure-domain.sh

# Deploy
cd ../docker
docker compose -f docker-compose.https.yml up -d --build
```

---

## 📚 Documentation

- **Complete Guide**: [DEPLOYMENT_WORKFLOW.md](DEPLOYMENT_WORKFLOW.md)
- **Ubuntu Guide**: [UBUNTU_QUICKSTART.md](UBUNTU_QUICKSTART.md)
- **Docker Guide**: [docker/README.md](docker/README.md)
- **HTTPS Setup**: [deployment/HTTPS_DUCKDNS_SETUP.md](deployment/HTTPS_DUCKDNS_SETUP.md)
- **All Docs**: [docs/INDEX.md](docs/INDEX.md)

---

## 💡 Quick Commands

```bash
# Update from git (recommended)
git pull origin main
cd docker && docker compose -f docker-compose.https.yml down
docker compose -f docker-compose.https.yml up -d --build

# Deploy HTTPS (first time)
./deployment/deploy-https.sh

# View logs
cd docker && docker compose -f docker-compose.https.yml logs -f

# Stop
cd docker && docker compose -f docker-compose.https.yml down

# Deploy HTTP (development)
cd docker && docker compose -f docker-compose.http.yml up -d --build
```

---

**Need help?** Check [docs/INDEX.md](docs/INDEX.md) for complete documentation.
