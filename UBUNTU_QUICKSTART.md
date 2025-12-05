# Ubuntu Quick Start Guide

Complete guide for deploying Page Daveyzieux from GitHub to Ubuntu with Docker.

## 🚀 Quick Deployment (3 Steps)

### Step 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux
```

### Step 2: Make deployment script executable

```bash
chmod +x deploy-ubuntu.sh
```

### Step 3: Run the deployment script

```bash
./deploy-ubuntu.sh
```

**That's it!** The script will:
- ✅ Install Docker and Docker Compose (if needed)
- ✅ Create .env configuration file
- ✅ Build Docker images
- ✅ Start all containers
- ✅ Run health checks
- ✅ Display access URLs

## 📋 What Gets Deployed

The deployment includes:
- **Node.js Application**: Express server with APIs
- **Nginx Reverse Proxy**: For production-grade performance
- **Health Monitoring**: Automatic health checks and restarts
- **Logging**: Automatic log rotation (30MB max)

### Architecture
```
Internet → Nginx (Port 3001) → Node.js App (Internal)
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual control:

### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

### 2. Clone and Configure

```bash
# Clone repository
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux

# Create environment file
cp .env.example .env
nano .env  # Edit with your actual credentials
```

### 3. Deploy with Docker Compose

```bash
# Build and start
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## 🧪 Testing Locally

### Test the Application

```bash
# 1. Check container health
docker compose ps
# Both containers should show "healthy" status

# 2. Test health endpoint
curl http://localhost:3001/health

# 3. Test weather API
curl http://localhost:3001/api/weather

# 4. Test IzitGreen API
curl http://localhost:3001/api/izit/status

# 5. Open in browser
# Local: http://localhost:3001
# Remote: http://YOUR_SERVER_IP:3001
```

### Expected Results

All endpoints should return JSON data:
- `/health` → `{"status":"ok","uptime":123}`
- `/api/weather` → Weather data for Paris
- `/api/izit/status` → IzitGreen connection status

## 🌐 Network Configuration

### Open Firewall Port

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 3001/tcp
sudo ufw status

# Check if port is open
sudo netstat -tlnp | grep 3001
```

### Test from Another Machine

```bash
# From your Windows PC or another machine
curl http://YOUR_UBUNTU_IP:3001/health

# Or open in browser
http://YOUR_UBUNTU_IP:3001
```

## 📊 Management Commands

### View Logs

```bash
# Real-time logs (all services)
docker compose logs -f

# Just the Node.js app
docker compose logs -f weather-dashboard

# Just nginx
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail 100
```

### Control Services

```bash
# Stop everything
docker compose down

# Start everything
docker compose up -d

# Restart a service
docker compose restart weather-dashboard

# Rebuild and restart
docker compose up -d --build
```

### Health Monitoring

```bash
# Check container health status
docker compose ps

# Detailed health check
docker inspect --format='{{.State.Health.Status}}' smart-building-weather

# Manual health test
curl http://localhost:3001/health
```

## 🔄 Update Deployment

When you push new code to GitHub:

### On Ubuntu:

```bash
cd Page_Daveyzieux

# Pull latest changes
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build

# Verify deployment
curl http://localhost:3001/health
```

### One-Liner Update

```bash
cd Page_Daveyzieux && git pull && docker compose up -d --build
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker compose logs

# Check if port is already in use
sudo netstat -tlnp | grep 3001

# Remove old containers and rebuild
docker compose down -v
docker compose up -d --build
```

### Can't Access from Browser

```bash
# 1. Check containers are running
docker compose ps

# 2. Check firewall
sudo ufw status

# 3. Test locally first
curl http://localhost:3001

# 4. Get your IP address
hostname -I

# 5. Test from remote machine
curl http://YOUR_IP:3001
```

### IzitGreen Data Not Loading

```bash
# 1. Check network connectivity to IzitGreen portal
ping 10.20.1.100

# 2. Test API access
curl -X POST http://10.20.1.100:8083/GetToken \
  -d "grant_type=password&username=Vincent&password=Admin.1024"

# 3. Check environment variables
docker compose exec weather-dashboard env | grep IZIT

# 4. Check container logs
docker compose logs weather-dashboard | grep -i izit
```

### Docker Not Found

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in, then test
docker --version
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `deploy-ubuntu.sh` | Automated deployment script |
| `.env` | Environment configuration (credentials) |
| `docker-compose.yml` | Multi-container orchestration |
| `Dockerfile` | Node.js application image |
| `docs/DEPLOYMENT.md` | Detailed deployment guide |

## 🔐 Environment Variables

Required in `.env` file:

```bash
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# IZITGreen Portal API
IZIT_API_BASE=http://10.20.1.100:8083
IZIT_USERNAME=Vincent
IZIT_PASSWORD=Admin.1024
```

## 🎯 Production Checklist

Before going to production:

- [ ] Updated `.env` with correct credentials
- [ ] Firewall configured (`ufw allow 3001/tcp`)
- [ ] Tested from local machine (`curl localhost:3001`)
- [ ] Tested from remote machine (`curl YOUR_IP:3001`)
- [ ] Verified IzitGreen connectivity
- [ ] Checked all API endpoints work
- [ ] Reviewed container logs (no errors)
- [ ] Set up monitoring/alerts (optional)

## 📞 Quick Reference

```bash
# Deploy
./deploy-ubuntu.sh

# View logs
docker compose logs -f

# Restart
docker compose restart

# Update
git pull && docker compose up -d --build

# Stop
docker compose down

# Check health
curl http://localhost:3001/health
```

## 🔗 Related Documentation

- [Main README](README.md) - Project overview
- [Detailed Deployment Guide](docs/DEPLOYMENT.md) - Complete deployment documentation
- [Project Structure](PROJECT_STRUCTURE.md) - Codebase organization
- [Code Documentation](docs/CODE-DOCUMENTATION.md) - API and code details

## 💡 Tips

1. **Always test locally first**: Use `curl localhost:3001` before testing remotely
2. **Check logs frequently**: `docker compose logs -f` is your friend
3. **Use health endpoints**: Monitor `/health` for application status
4. **Keep .env secure**: Never commit credentials to Git
5. **Update regularly**: Run `git pull && docker compose up -d --build` for updates

---

**Success!** Your Page Daveyzieux dashboard should now be running on Ubuntu 🎉

For issues or questions, check the logs first: `docker compose logs -f`
