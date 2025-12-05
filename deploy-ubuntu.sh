#!/bin/bash
# Ubuntu Deployment Script for Page Daveyzieux
# This script automates the deployment process on Ubuntu

set -e  # Exit on error

echo "========================================="
echo "Page Daveyzieux - Ubuntu Deployment"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print success messages
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print info messages
info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Function to print error messages
error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running on Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    error "This script is designed for Ubuntu/Debian systems"
    exit 1
fi

success "Running on Ubuntu/Debian system"

# Check if Docker is installed
info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Installing Docker..."

    # Update package index
    sudo apt-get update

    # Install prerequisites
    sudo apt-get install -y ca-certificates curl gnupg lsb-release

    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Add current user to docker group
    sudo usermod -aG docker $USER

    success "Docker installed successfully"
    info "You may need to log out and back in for group changes to take effect"
else
    success "Docker is already installed"
fi

# Check if Docker Compose is installed
info "Checking Docker Compose installation..."
if ! docker compose version &> /dev/null; then
    error "Docker Compose plugin not found"
    sudo apt-get install -y docker-compose-plugin
    success "Docker Compose installed successfully"
else
    success "Docker Compose is already installed"
fi

# Display versions
echo ""
info "Installed versions:"
docker --version
docker compose version
echo ""

# Stop any existing containers
info "Stopping any existing containers..."
if docker ps -q --filter "name=smart-building" | grep -q .; then
    docker compose down
    success "Existing containers stopped"
else
    info "No existing containers found"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    info "Creating .env file from .env.example..."
    cp .env.example .env
    success ".env file created"
    echo ""
    error "IMPORTANT: Please edit .env file with your actual credentials"
    echo "  nano .env"
    echo ""
    read -p "Press Enter when you've updated the .env file..."
else
    success ".env file already exists"
fi

# Build and start containers
echo ""
info "Building Docker images... (this may take a few minutes)"
docker compose build

success "Docker images built successfully"
echo ""

info "Starting containers..."
docker compose up -d

success "Containers started successfully"
echo ""

# Wait for containers to be healthy
info "Waiting for containers to be healthy..."
sleep 10

# Check container status
echo ""
info "Container status:"
docker compose ps
echo ""

# Test endpoints
info "Testing application endpoints..."
echo ""

# Wait a bit more for the app to fully start
sleep 5

# Test health endpoint
if curl -f -s http://localhost:3001/health > /dev/null; then
    success "Health check: OK"
else
    error "Health check: FAILED"
fi

# Test weather API
if curl -f -s http://localhost:3001/api/weather > /dev/null; then
    success "Weather API: OK"
else
    error "Weather API: FAILED"
fi

# Test main page
if curl -f -s http://localhost:3001 > /dev/null; then
    success "Main page: OK"
else
    error "Main page: FAILED"
fi

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
success "Application is running at: http://localhost:3001"
success "Or from another machine: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
info "Useful commands:"
echo "  View logs:          docker compose logs -f"
echo "  Stop application:   docker compose down"
echo "  Restart:            docker compose restart"
echo "  Update and restart: git pull && docker compose up -d --build"
echo ""
info "For detailed documentation, see docs/DEPLOYMENT.md"
echo ""

# Configure firewall if UFW is installed
if command -v ufw &> /dev/null; then
    info "UFW firewall detected"
    echo "To allow external access, run:"
    echo "  sudo ufw allow 3001/tcp"
    echo ""
fi
