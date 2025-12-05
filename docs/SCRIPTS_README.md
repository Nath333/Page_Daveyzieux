# Scripts Directory

Utility scripts for development, deployment, and maintenance tasks.

## Available Scripts

### [start-dev.sh](start-dev.sh)
Development startup script that:
- Checks for and installs dependencies
- Creates .env from .env.example if needed
- Starts the development server

**Usage:**
```bash
./scripts/start-dev.sh
```

### [health-check.sh](health-check.sh)
Health monitoring script that:
- Checks application health endpoint
- Verifies all API endpoints are responding
- Reports status of each service

**Usage:**
```bash
# Check localhost
./scripts/health-check.sh

# Check specific host and port
./scripts/health-check.sh example.com 3001
```

**Requirements:**
- `curl` command-line tool
- `jq` for JSON parsing (optional but recommended)

### [docker-cleanup.sh](docker-cleanup.sh)
Docker cleanup utility that:
- Stops all containers
- Removes dangling images
- Optionally prunes unused volumes

**Usage:**
```bash
./scripts/docker-cleanup.sh
```

**Warning:** Be careful with volume pruning as it removes all unused volumes.

### [rebuild.sh](rebuild.sh)
Complete rebuild script that:
- Stops and removes existing containers
- Removes old images
- Rebuilds from scratch with no cache
- Starts services and shows logs

**Usage:**
```bash
./scripts/rebuild.sh
```

Use this when you need a completely fresh build.

## Making Scripts Executable

On Unix-based systems (Linux/macOS), make scripts executable:

```bash
chmod +x scripts/*.sh
```

## Windows Users

For Windows, you can:

1. **Use Git Bash:**
   ```bash
   bash scripts/start-dev.sh
   ```

2. **Use WSL (Windows Subsystem for Linux):**
   ```bash
   ./scripts/start-dev.sh
   ```

3. **Create PowerShell equivalents:**
   Create `.ps1` versions of these scripts for native Windows support.

## Adding New Scripts

When creating new scripts:

1. Add the script to this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add shebang line: `#!/bin/bash`
4. Document it in this README
5. Include usage examples
6. Handle errors gracefully

### Script Template

```bash
#!/bin/bash
# Description of what this script does

set -e  # Exit on error

echo "🚀 Starting script..."

# Your script logic here

echo "✓ Script complete!"
```

## Common Issues

### Permission Denied
```bash
chmod +x scripts/your-script.sh
```

### Command Not Found
Ensure the script is in the scripts directory and you're running from project root:
```bash
./scripts/your-script.sh  # Not scripts/your-script.sh
```

### Docker Not Running
Some scripts require Docker to be running:
```bash
# Start Docker Desktop (macOS/Windows)
# Or start Docker daemon (Linux)
sudo systemctl start docker
```
