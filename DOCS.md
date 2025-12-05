# Documentation Map

**Quick navigation to all documentation for Page Daveyzieux.**

---

## 🚀 Getting Started

**New user?** Start here in order:

1. [README.md](README.md) - Project overview
2. [QUICKSTART.md](QUICKSTART.md) - Deploy in 3 commands
3. Choose your path below

---

## 📚 Documentation by Purpose

### I want to deploy the application

| Document | Use When |
|----------|----------|
| **[QUICKSTART.md](QUICKSTART.md)** | You want to deploy NOW (3 commands) |
| **[deployment/README.md](deployment/README.md)** | You want to understand deployment scripts |
| **[deployment/HTTPS_DUCKDNS_SETUP.md](deployment/HTTPS_DUCKDNS_SETUP.md)** | You want HTTPS with DuckDNS |
| **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** | You want detailed deployment guide |

**Quick answer**: Run `./deployment/deploy-https.sh`

---

### I want to understand Docker

| Document | Use When |
|----------|----------|
| **[docker/README.md](docker/README.md)** | Complete Docker configuration guide |
| **[docs/NGINX.md](docs/NGINX.md)** | Nginx configuration details |

**Quick answer**: All Docker files are in `docker/` folder

---

### I want to understand the code

| Document | Use When |
|----------|----------|
| **[docs/CODE-DOCUMENTATION.md](docs/CODE-DOCUMENTATION.md)** | Complete code documentation |
| **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** | Project architecture |
| **[docs/SRC_README.md](docs/SRC_README.md)** | Source code overview |

**Quick answer**: Start with [docs/CODE-DOCUMENTATION.md](docs/CODE-DOCUMENTATION.md)

---

### I want to use helper scripts

| Document | Use When |
|----------|----------|
| **[docs/SCRIPTS_README.md](docs/SCRIPTS_README.md)** | Learn about helper scripts |

**Quick answer**: Scripts are in `scripts/` folder

---

### I want to test the application

| Document | Use When |
|----------|----------|
| **[docs/TESTS_README.md](docs/TESTS_README.md)** | Testing guide |

---

### I want to see all documentation

| Document | Use When |
|----------|----------|
| **[docs/INDEX.md](docs/INDEX.md)** | Master documentation index |

---

## 📁 Complete Documentation Structure

```
Page_Daveyzieux/
│
├── README.md                        # Main project documentation
├── QUICKSTART.md                    # 3-command deployment guide
├── DOCS.md                          # This file (documentation map)
│
├── deployment/
│   ├── README.md                    # Deployment scripts guide
│   └── HTTPS_DUCKDNS_SETUP.md      # HTTPS setup with DuckDNS
│
├── docker/
│   └── README.md                    # Docker configuration guide
│
└── docs/
    ├── INDEX.md                     # Master documentation index
    ├── CODE-DOCUMENTATION.md        # Complete code documentation
    ├── DEPLOYMENT.md                # Detailed deployment guide
    ├── NGINX.md                     # Nginx configuration guide
    ├── PROJECT_STRUCTURE.md         # Project architecture
    ├── SCRIPTS_README.md            # Helper scripts guide
    ├── SRC_README.md                # Source code overview
    └── TESTS_README.md              # Testing documentation
```

---

## 🎯 Common Questions

### How do I deploy this?

**Answer**: [QUICKSTART.md](QUICKSTART.md) - Just 3 commands

### How do I set up HTTPS?

**Answer**: [deployment/HTTPS_DUCKDNS_SETUP.md](deployment/HTTPS_DUCKDNS_SETUP.md)

### Where are the Docker configs?

**Answer**: [docker/README.md](docker/README.md)

### How does the code work?

**Answer**: [docs/CODE-DOCUMENTATION.md](docs/CODE-DOCUMENTATION.md)

### What's the project structure?

**Answer**: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

### Where is everything?

**Answer**: [docs/INDEX.md](docs/INDEX.md)

---

## 📖 Documentation Categories

### Level 1: Quick Start
- [README.md](README.md) - Overview
- [QUICKSTART.md](QUICKSTART.md) - Deploy now

### Level 2: Deployment
- [deployment/README.md](deployment/README.md) - Scripts
- [deployment/HTTPS_DUCKDNS_SETUP.md](deployment/HTTPS_DUCKDNS_SETUP.md) - HTTPS
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Details

### Level 3: Configuration
- [docker/README.md](docker/README.md) - Docker
- [docs/NGINX.md](docs/NGINX.md) - Nginx

### Level 4: Development
- [docs/CODE-DOCUMENTATION.md](docs/CODE-DOCUMENTATION.md) - Code
- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Architecture
- [docs/SRC_README.md](docs/SRC_README.md) - Source
- [docs/SCRIPTS_README.md](docs/SCRIPTS_README.md) - Scripts
- [docs/TESTS_README.md](docs/TESTS_README.md) - Testing

### Level 5: Reference
- [docs/INDEX.md](docs/INDEX.md) - Complete index

---

## 💡 Documentation Principles

**No Redundancy**:
- Each topic has ONE authoritative document
- Cross-references instead of duplication
- Clear hierarchy

**Easy Navigation**:
- Start simple (README → QUICKSTART)
- Go deeper as needed (DEPLOYMENT → CODE)
- Master index available (docs/INDEX.md)

**Purpose-Driven**:
- Deploy? → deployment/
- Configure? → docker/
- Develop? → docs/
- Everything? → docs/INDEX.md

---

**Lost?** Start with [QUICKSTART.md](QUICKSTART.md) or [docs/INDEX.md](docs/INDEX.md)
