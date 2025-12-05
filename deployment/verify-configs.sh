#!/bin/bash
# Verify all Docker and Nginx configurations

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
info() { echo -e "${YELLOW}ℹ${NC} $1"; }

echo "========================================="
echo "  Configuration Verification"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
    exit 1
fi
success "Docker is installed"

# Test HTTP nginx configuration
info "Testing HTTP nginx configuration..."
if docker run --rm -v "$(pwd)/deployment/nginx/nginx.conf":/etc/nginx/nginx.conf:ro nginx:1.25-alpine nginx -t 2>&1 | grep -q "successful"; then
    success "HTTP nginx config is valid"
else
    error "HTTP nginx config has errors"
    docker run --rm -v "$(pwd)/deployment/nginx/nginx.conf":/etc/nginx/nginx.conf:ro nginx:1.25-alpine nginx -t
    exit 1
fi

# Test HTTPS nginx configuration
info "Testing HTTPS nginx configuration..."
if docker run --rm -v "$(pwd)/deployment/nginx/nginx-ssl.conf":/etc/nginx/nginx.conf:ro nginx:1.25-alpine nginx -t 2>&1 | grep -q "successful"; then
    success "HTTPS nginx config is valid"
else
    error "HTTPS nginx config has errors"
    docker run --rm -v "$(pwd)/deployment/nginx/nginx-ssl.conf":/etc/nginx/nginx.conf:ro nginx:1.25-alpine nginx -t
    exit 1
fi

# Check if docker-compose.yml is valid
info "Testing docker-compose.yml..."
if docker compose -f docker-compose.yml config > /dev/null 2>&1; then
    success "docker-compose.yml is valid"
else
    error "docker-compose.yml has errors"
    docker compose -f docker-compose.yml config
    exit 1
fi

# Check if docker-compose-https.yml is valid
info "Testing docker-compose-https.yml..."
if docker compose -f docker-compose-https.yml config > /dev/null 2>&1; then
    success "docker-compose-https.yml is valid"
else
    error "docker-compose-https.yml has errors"
    docker compose -f docker-compose-https.yml config
    exit 1
fi

# Check if Dockerfile exists and is readable
info "Checking Dockerfile..."
if [ -f "Dockerfile" ]; then
    success "Dockerfile exists"
else
    error "Dockerfile not found"
    exit 1
fi

# Check nginx Dockerfiles
info "Checking nginx Dockerfiles..."
if [ -f "deployment/nginx/Dockerfile.nginx" ]; then
    success "Dockerfile.nginx exists"
else
    error "Dockerfile.nginx not found"
    exit 1
fi

if [ -f "deployment/nginx/Dockerfile.nginx-ssl" ]; then
    success "Dockerfile.nginx-ssl exists"
else
    error "Dockerfile.nginx-ssl not found"
    exit 1
fi

# Check deployment scripts
info "Checking deployment scripts..."
if [ -f "deploy-ubuntu.sh" ] && [ -x "deploy-ubuntu.sh" ]; then
    success "deploy-ubuntu.sh exists and is executable"
elif [ -f "deploy-ubuntu.sh" ]; then
    info "deploy-ubuntu.sh exists but is not executable (run: chmod +x deploy-ubuntu.sh)"
else
    error "deploy-ubuntu.sh not found"
fi

if [ -f "deploy-https.sh" ] && [ -x "deploy-https.sh" ]; then
    success "deploy-https.sh exists and is executable"
elif [ -f "deploy-https.sh" ]; then
    info "deploy-https.sh exists but is not executable (run: chmod +x deploy-https.sh)"
else
    error "deploy-https.sh not found"
fi

echo ""
echo "========================================="
echo "  ✓ All Configurations Valid!"
echo "========================================="
echo ""
info "You can now deploy:"
echo "  HTTP:  docker compose up -d --build"
echo "  HTTPS: docker compose -f docker-compose-https.yml up -d --build"
echo ""
