# Documentation Index

Complete guide to all documentation for Page Daveyzieux.

---

## 🚀 Quick Start

**New to the project?** Start here:

1. [README.md](../README.md) - Project overview and features
2. [UBUNTU_QUICKSTART.md](../UBUNTU_QUICKSTART.md) - Fast deployment guide
3. [DEPLOYMENT_WORKFLOW.md](../DEPLOYMENT_WORKFLOW.md) - Complete workflow

---

## 📚 Documentation Structure

### Getting Started

| Document | Description | Audience |
|----------|-------------|----------|
| [README.md](../README.md) | Main project documentation | Everyone |
| [UBUNTU_QUICKSTART.md](../UBUNTU_QUICKSTART.md) | Quick deployment on Ubuntu | DevOps/Sysadmin |
| [DEPLOYMENT_WORKFLOW.md](../DEPLOYMENT_WORKFLOW.md) | Complete deployment workflow | DevOps/Sysadmin |

### Deployment Guides

| Document | Description | Use Case |
|----------|-------------|----------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Detailed deployment guide | Production deployment |
| [deployment/README.md](../deployment/README.md) | Deployment folder overview | Understanding configs |
| [deployment/HTTPS_DUCKDNS_SETUP.md](../deployment/HTTPS_DUCKDNS_SETUP.md) | HTTPS with DuckDNS setup | HTTPS deployment |
| [NGINX.md](NGINX.md) | Nginx configuration guide | Nginx customization |

### Development & Architecture

| Document | Description | Audience |
|----------|-------------|----------|
| [CODE-DOCUMENTATION.md](CODE-DOCUMENTATION.md) | Complete code documentation | Developers |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Project organization | Developers |
| [SRC_README.md](SRC_README.md) | Source code overview | Developers |

### Testing & Scripts

| Document | Description | Purpose |
|----------|-------------|---------|
| [TESTS_README.md](TESTS_README.md) | Testing documentation | Quality assurance |
| [SCRIPTS_README.md](SCRIPTS_README.md) | Helper scripts guide | Automation |

---

## 🗂️ By Topic

### Deployment

#### First Time Deployment
1. Read [UBUNTU_QUICKSTART.md](../UBUNTU_QUICKSTART.md)
2. Choose HTTP or HTTPS
3. Follow [DEPLOYMENT_WORKFLOW.md](../DEPLOYMENT_WORKFLOW.md)

#### HTTPS Deployment
1. Set up DuckDNS: [deployment/HTTPS_DUCKDNS_SETUP.md](../deployment/HTTPS_DUCKDNS_SETUP.md)
2. Configure nginx: [deployment/README.md](../deployment/README.md)
3. Deploy: Run `./deploy-https.sh`

#### Production Deployment
1. Review [DEPLOYMENT.md](DEPLOYMENT.md)
2. Check [NGINX.md](NGINX.md) for optimization
3. Follow production checklist

### Development

#### Understanding the Codebase
1. Start with [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. Read [CODE-DOCUMENTATION.md](CODE-DOCUMENTATION.md)
3. Explore [SRC_README.md](SRC_README.md)

#### Making Changes
1. Read [CODE-DOCUMENTATION.md](CODE-DOCUMENTATION.md)
2. Check [TESTS_README.md](TESTS_README.md)
3. Use [SCRIPTS_README.md](SCRIPTS_README.md) for automation

### Docker & Containers

#### Understanding Docker Setup
1. [deployment/README.md](../deployment/README.md) - Config overview
2. [NGINX.md](NGINX.md) - Nginx container details
3. [DEPLOYMENT.md](DEPLOYMENT.md) - Docker Compose usage

#### Customizing Docker
1. Check [deployment/README.md](../deployment/README.md)
2. Review [NGINX.md](NGINX.md)
3. Modify configs in `deployment/nginx/`

---

## 📖 Complete File List

### Root Documentation
```
/
├── README.md                   # Main project documentation
├── UBUNTU_QUICKSTART.md        # Quick start guide for Ubuntu
└── DEPLOYMENT_WORKFLOW.md      # Complete deployment workflow
```

### Deployment Configuration
```
deployment/
├── README.md                   # Deployment folder overview
├── HTTPS_DUCKDNS_SETUP.md     # HTTPS setup guide
├── configure-domain.sh         # Domain configuration script
├── verify-configs.sh           # Configuration verification
└── nginx/
    ├── nginx.conf              # HTTP nginx config
    ├── nginx-ssl.conf          # HTTPS nginx config
    ├── Dockerfile.nginx        # HTTP Docker image
    └── Dockerfile.nginx-ssl    # HTTPS Docker image
```

### Detailed Documentation
```
docs/
├── INDEX.md                    # This file
├── CODE-DOCUMENTATION.md       # Complete code documentation
├── DEPLOYMENT.md               # Detailed deployment guide
├── NGINX.md                    # Nginx configuration guide
├── PROJECT_STRUCTURE.md        # Project organization
├── README.md                   # Documentation overview
├── SCRIPTS_README.md           # Helper scripts guide
├── SRC_README.md               # Source code overview
└── TESTS_README.md             # Testing documentation
```

### Scripts
```
scripts/
├── docker-cleanup.sh           # Clean Docker resources
├── health-check.sh             # Check application health
├── rebuild.sh                  # Rebuild and restart
└── start-dev.sh                # Start development server
```

### Root Scripts
```
/
├── deploy-ubuntu.sh            # HTTP deployment script
└── deploy-https.sh             # HTTPS deployment script
```

---

## 🎯 Common Tasks

### Task: Deploy to Ubuntu for the First Time

**Quick path:**
```bash
# Read UBUNTU_QUICKSTART.md then:
./deploy-https.sh
```

**Detailed path:**
1. [UBUNTU_QUICKSTART.md](../UBUNTU_QUICKSTART.md) - Overview
2. [deployment/HTTPS_DUCKDNS_SETUP.md](../deployment/HTTPS_DUCKDNS_SETUP.md) - HTTPS setup
3. [DEPLOYMENT_WORKFLOW.md](../DEPLOYMENT_WORKFLOW.md) - Complete workflow

**Documents to read:**
- [UBUNTU_QUICKSTART.md](../UBUNTU_QUICKSTART.md)
- [deployment/HTTPS_DUCKDNS_SETUP.md](../deployment/HTTPS_DUCKDNS_SETUP.md)
- [deployment/README.md](../deployment/README.md)

### Task: Understand the Code

**Path:**
1. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture overview
2. [CODE-DOCUMENTATION.md](CODE-DOCUMENTATION.md) - Detailed code docs
3. [SRC_README.md](SRC_README.md) - Source code guide

### Task: Customize Nginx Configuration

**Path:**
1. [NGINX.md](NGINX.md) - Nginx guide
2. [deployment/README.md](../deployment/README.md) - Config structure
3. Edit `deployment/nginx/nginx.conf` or `nginx-ssl.conf`

### Task: Troubleshoot Deployment

**Path:**
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Troubleshooting section
2. [UBUNTU_QUICKSTART.md](../UBUNTU_QUICKSTART.md) - Common issues
3. [deployment/README.md](../deployment/README.md) - Testing configs

### Task: Set Up HTTPS with DuckDNS

**Path:**
1. [deployment/HTTPS_DUCKDNS_SETUP.md](../deployment/HTTPS_DUCKDNS_SETUP.md) - Complete guide
2. [deployment/README.md](../deployment/README.md) - Config overview
3. Run `./deploy-https.sh`

---

## 🔍 Finding Information

### By Keyword

| Looking for... | Check these documents |
|---------------|----------------------|
| **Deployment** | DEPLOYMENT.md, UBUNTU_QUICKSTART.md, DEPLOYMENT_WORKFLOW.md |
| **HTTPS/SSL** | deployment/HTTPS_DUCKDNS_SETUP.md, NGINX.md |
| **DuckDNS** | deployment/HTTPS_DUCKDNS_SETUP.md |
| **Docker** | deployment/README.md, DEPLOYMENT.md |
| **Nginx** | NGINX.md, deployment/README.md |
| **Code** | CODE-DOCUMENTATION.md, SRC_README.md |
| **API** | CODE-DOCUMENTATION.md, README.md |
| **Testing** | TESTS_README.md |
| **Scripts** | SCRIPTS_README.md |
| **Architecture** | PROJECT_STRUCTURE.md, CODE-DOCUMENTATION.md |
| **Troubleshooting** | DEPLOYMENT.md, UBUNTU_QUICKSTART.md |

---

## 💡 Tips for Using This Documentation

1. **Start with the overview**: Always begin with README.md or UBUNTU_QUICKSTART.md
2. **Use the index**: This file (INDEX.md) helps you find what you need
3. **Follow the paths**: We provide step-by-step reading paths for common tasks
4. **Check deployment/ folder**: Contains all configuration files and guides
5. **Refer to CODE-DOCUMENTATION.md**: Most comprehensive technical reference

---

## 🔄 Documentation Maintenance

This documentation is kept up-to-date with each deployment. When you make changes:

1. Update relevant documentation files
2. Update this INDEX.md if you add/remove documents
3. Commit documentation changes with code changes

---

## 📞 Need Help?

1. **First**: Check this INDEX.md for the relevant document
2. **Deployment issues**: See [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting
3. **HTTPS issues**: See [deployment/HTTPS_DUCKDNS_SETUP.md](../deployment/HTTPS_DUCKDNS_SETUP.md)
4. **Code questions**: See [CODE-DOCUMENTATION.md](CODE-DOCUMENTATION.md)
5. **Check logs**: `docker compose logs -f`

---

**Last Updated**: December 5, 2025
**Repository**: https://github.com/Nath333/Page_Daveyzieux
