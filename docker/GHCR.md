# GitHub Container Registry (GHCR) Deployment

Deploy Page Daveyzieux using pre-built Docker images from GitHub Container Registry.

---

## 🎯 Overview

**Why GHCR?**
- ✅ Pre-built images - no build time on server
- ✅ Faster deployment - just pull and run
- ✅ Version control - tag specific versions
- ✅ Free for public repositories
- ✅ Integrated with GitHub

---

## 📦 Available Images

| Image | Size | Purpose |
|-------|------|---------|
| `ghcr.io/nath333/page-daveyzieux-app:latest` | 222MB | Node.js application |
| `ghcr.io/nath333/page-daveyzieux-nginx:latest` | 84MB | Nginx HTTPS proxy |

**Total**: ~306MB (vs building ~2GB+ including layers)

---

## 🚀 Quick Deployment (GHCR)

### Pull and Run

```bash
# Clone repository
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux/docker

# Pull images from GHCR
docker compose -f docker-compose.ghcr.yml pull

# Start services
docker compose -f docker-compose.ghcr.yml up -d
```

**That's it!** No build required ⚡

---

## 📋 Deployment Options

### Option 1: GHCR Images (Production) ⭐

**When**: Production servers, fast deployment

```bash
cd docker
docker compose -f docker-compose.ghcr.yml up -d
```

**Pros**:
- ✅ Fast - no build time
- ✅ Consistent - same image everywhere
- ✅ Tested - images pre-built and tested

---

### Option 2: Local Build (Development)

**When**: Development, testing changes

```bash
cd docker
docker compose -f docker-compose.https.yml up -d --build
```

**Pros**:
- ✅ Latest code changes
- ✅ Local modifications
- ✅ No registry needed

---

## 🔧 Managing Images

### Pull Latest Images

```bash
cd docker
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

### Check Image Versions

```bash
docker images | grep ghcr.io/nath333/page-daveyzieux
```

### Update Images

```bash
# Pull latest
docker compose -f docker-compose.ghcr.yml pull

# Restart with new images
docker compose -f docker-compose.ghcr.yml up -d
```

---

## 🛠️ Building and Pushing Images

**For maintainers**: Update images in GHCR

### 1. Build Images

```bash
cd docker
docker compose -f docker-compose.https.yml build
```

### 2. Tag Images

```bash
docker tag docker-app:latest ghcr.io/nath333/page-daveyzieux-app:latest
docker tag docker-nginx:latest ghcr.io/nath333/page-daveyzieux-nginx:latest
```

### 3. Login to GHCR

**Option A - Using GitHub CLI (recommended):**
```bash
gh auth refresh -s write:packages
gh auth token | docker login ghcr.io -u Nath333 --password-stdin
```

**Option B - Using Personal Access Token:**
```bash
# Create token at: https://github.com/settings/tokens/new
# Scopes needed: write:packages, read:packages

echo YOUR_TOKEN | docker login ghcr.io -u Nath333 --password-stdin
```

### 4. Push Images

```bash
docker push ghcr.io/nath333/page-daveyzieux-app:latest
docker push ghcr.io/nath333/page-daveyzieux-nginx:latest
```

### 5. Tag Versions (Optional)

```bash
# Tag specific version
docker tag ghcr.io/nath333/page-daveyzieux-app:latest ghcr.io/nath333/page-daveyzieux-app:v1.0.0
docker push ghcr.io/nath333/page-daveyzieux-app:v1.0.0
```

---

## 📖 Complete Build & Push Workflow

```bash
# 1. Build images
cd docker
docker compose -f docker-compose.https.yml build

# 2. Tag for GHCR
docker tag docker-app:latest ghcr.io/nath333/page-daveyzieux-app:latest
docker tag docker-nginx:latest ghcr.io/nath333/page-daveyzieux-nginx:latest

# 3. Login (using GitHub CLI)
gh auth refresh -s write:packages
gh auth token | docker login ghcr.io -u Nath333 --password-stdin

# 4. Push
docker push ghcr.io/nath333/page-daveyzieux-app:latest
docker push ghcr.io/nath333/page-daveyzieux-nginx:latest

# 5. Verify on GitHub
# Visit: https://github.com/Nath333?tab=packages
```

---

## 🌐 Deployment Scenarios

### Scenario 1: Fresh Server Deployment

```bash
# On new Ubuntu server
git clone https://github.com/Nath333/Page_Daveyzieux.git
cd Page_Daveyzieux
./deployment/deploy-https.sh
```

The script will automatically use GHCR images if available.

---

### Scenario 2: Update Existing Deployment

```bash
# On production server
cd Page_Daveyzieux/docker

# Pull latest images
docker compose -f docker-compose.ghcr.yml pull

# Restart services
docker compose -f docker-compose.ghcr.yml up -d

# Verify
curl https://your-domain.duckdns.org/health
```

---

### Scenario 3: Rollback to Previous Version

```bash
# Use specific version tag
docker pull ghcr.io/nath333/page-daveyzieux-app:v1.0.0
docker pull ghcr.io/nath333/page-daveyzieux-nginx:v1.0.0

# Update docker-compose.ghcr.yml to use :v1.0.0
# Restart
docker compose -f docker-compose.ghcr.yml up -d
```

---

## 🔐 Authentication

### Making Images Public

1. Go to: https://github.com/Nath333?tab=packages
2. Click on package name
3. Package settings → Change visibility → Public

**Note**: Images are private by default.

### Pulling Private Images

```bash
# Login first
echo YOUR_TOKEN | docker login ghcr.io -u Nath333 --password-stdin

# Then pull
docker compose -f docker-compose.ghcr.yml pull
```

---

## 📊 Image Information

### View Image Details

```bash
# List GHCR images
docker images | grep ghcr.io/nath333

# Inspect image
docker inspect ghcr.io/nath333/page-daveyzieux-app:latest

# View layers
docker history ghcr.io/nath333/page-daveyzieux-app:latest
```

### Image Sizes

```bash
docker images ghcr.io/nath333/page-daveyzieux-app --format "{{.Repository}}:{{.Tag}} - {{.Size}}"
docker images ghcr.io/nath333/page-daveyzieux-nginx --format "{{.Repository}}:{{.Tag}} - {{.Size}}"
```

---

## 🐛 Troubleshooting

### Pull Fails with 403 Forbidden

**Solution**: Login to GHCR
```bash
gh auth token | docker login ghcr.io -u Nath333 --password-stdin
```

### Image Not Found

**Solution**: Check if images were pushed
```bash
# View packages on GitHub
# https://github.com/Nath333?tab=packages

# Or check locally
docker images | grep ghcr.io/nath333
```

### Old Image Cached

**Solution**: Force pull latest
```bash
docker compose -f docker-compose.ghcr.yml pull --force-recreate
docker compose -f docker-compose.ghcr.yml up -d --force-recreate
```

---

## 💡 Best Practices

1. **Tag Versions**
   ```bash
   # Always tag versions for production
   docker tag app:latest ghcr.io/nath333/page-daveyzieux-app:v1.0.0
   ```

2. **Test Before Push**
   ```bash
   # Test images locally before pushing
   docker compose -f docker-compose.https.yml up -d
   # Run tests
   # Then push to GHCR
   ```

3. **Use SHA Tags**
   ```bash
   # For critical deployments, use SHA tags
   GIT_SHA=$(git rev-parse --short HEAD)
   docker tag app:latest ghcr.io/nath333/page-daveyzieux-app:$GIT_SHA
   ```

4. **Automate with CI/CD**
   - GitHub Actions can auto-build and push on every release
   - See: `.github/workflows/docker-publish.yml` (if exists)

---

## 🎯 Quick Reference

```bash
# Build and push (maintainer)
cd docker && docker compose -f docker-compose.https.yml build
docker tag docker-app:latest ghcr.io/nath333/page-daveyzieux-app:latest
docker tag docker-nginx:latest ghcr.io/nath333/page-daveyzieux-nginx:latest
gh auth token | docker login ghcr.io -u Nath333 --password-stdin
docker push ghcr.io/nath333/page-daveyzieux-app:latest
docker push ghcr.io/nath333/page-daveyzieux-nginx:latest

# Deploy from GHCR (production)
cd docker
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d

# Update deployment
git pull
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d

# View logs
docker compose -f docker-compose.ghcr.yml logs -f

# Stop
docker compose -f docker-compose.ghcr.yml down
```

---

## 📚 Related Documentation

- [Docker README](README.md) - Complete Docker guide
- [Deployment Guide](../deployment/README.md) - Deployment scripts
- [QUICKSTART](../QUICKSTART.md) - Fast deployment

---

**Images built and ready to push to GHCR!** 🐳✨
