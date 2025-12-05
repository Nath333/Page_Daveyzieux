# Quick Start Guide

**Page Daveyzieux** - Fast deployment on Ubuntu with Docker

---

## 🚀 Deploy in 3 Commands

### HTTPS Production (Recommended)

```bash
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux
./deployment/deploy-https.sh
```

**Access**: https://your-domain.duckdns.org

---

### HTTP Testing (Development)

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
# Deploy HTTPS (automated)
./deployment/deploy-https.sh

# Deploy HTTP (manual)
cd docker && docker compose -f docker-compose.http.yml up -d --build

# View logs
cd docker && docker compose -f docker-compose.https.yml logs -f

# Stop
cd docker && docker compose -f docker-compose.https.yml down

# Update
git pull && cd docker && docker compose -f docker-compose.https.yml up -d --build
```

---

**Need help?** Check [docs/INDEX.md](docs/INDEX.md) for complete documentation.
