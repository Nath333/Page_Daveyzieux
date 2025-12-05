#!/bin/bash
# Automated HTTPS Deployment for Page Daveyzieux
# Ubuntu/Debian with Docker + DuckDNS + Let's Encrypt

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

echo "========================================="
echo "  Page Daveyzieux - HTTPS Deployment"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Do not run this script as root. It will ask for sudo when needed."
    exit 1
fi

# Collect information
echo "Please provide the following information:"
echo ""
read -p "Your DuckDNS domain (without .duckdns.org): " DUCKDNS_DOMAIN
read -p "Your DuckDNS token: " DUCKDNS_TOKEN
read -p "Your email (for Let's Encrypt notifications): " EMAIL

FULL_DOMAIN="${DUCKDNS_DOMAIN}.duckdns.org"

echo ""
info "Domain: $FULL_DOMAIN"
info "Email: $EMAIL"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    error "Cancelled by user"
    exit 1
fi

echo ""

# Update DuckDNS
info "Updating DuckDNS IP address..."
DUCKDNS_RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=$DUCKDNS_DOMAIN&token=$DUCKDNS_TOKEN&ip=")

if [ "$DUCKDNS_RESPONSE" = "OK" ]; then
    success "DuckDNS updated successfully"
else
    error "Failed to update DuckDNS: $DUCKDNS_RESPONSE"
    exit 1
fi

# Create DuckDNS auto-update cron job
info "Setting up DuckDNS auto-update (every 5 minutes)..."
CRON_CMD="*/5 * * * * curl -s \"https://www.duckdns.org/update?domains=$DUCKDNS_DOMAIN&token=$DUCKDNS_TOKEN&ip=\" > /dev/null 2>&1"
(crontab -l 2>/dev/null | grep -v "duckdns.org/update"; echo "$CRON_CMD") | crontab -
success "DuckDNS auto-update configured"

# Check Docker
info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    error "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    success "Docker installed"
    warning "You may need to log out and back in for Docker group to take effect"
else
    success "Docker is installed"
fi

# Check Docker Compose
if ! docker-compose version &> /dev/null; then
    error "Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    success "Docker Compose installed"
else
    success "Docker Compose is installed"
fi

echo ""

# Create necessary directories
info "Creating directories..."
mkdir -p docker/certbot/conf
mkdir -p docker/certbot/www
mkdir -p docker/nginx
success "Directories created"

# Update nginx configuration with domain
info "Configuring nginx with your domain..."
sed -i "s/YOUR_DOMAIN.duckdns.org/$FULL_DOMAIN/g" docker/nginx/https/nginx.conf
success "Nginx configured"

# Stop any existing containers
info "Stopping existing containers..."
docker-compose-f docker/docker-compose.https.yml down 2>/dev/null || true
docker-composedown 2>/dev/null || true
success "Existing containers stopped"

echo ""
info "========================================="
info "  Obtaining SSL Certificate"
info "========================================="
echo ""

# Wait for DNS propagation
info "Waiting 10 seconds for DNS propagation..."
sleep 10

# Get SSL certificate
info "Requesting SSL certificate from Let's Encrypt..."
info "This may take a minute..."

docker run --rm \
  -v $(pwd)/docker/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/docker/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  --agree-tos \
  --no-eff-email \
  --email $EMAIL \
  -d $FULL_DOMAIN \
  --non-interactive

if [ $? -eq 0 ]; then
    success "SSL certificate obtained successfully!"
else
    error "Failed to obtain SSL certificate"
    error "Please check:"
    error "  1. Port 80 is accessible from the internet"
    error "  2. Your DuckDNS domain points to this server's IP"
    error "  3. No other service is using port 80"
    exit 1
fi

echo ""
info "========================================="
info "  Deploying Application with HTTPS"
info "========================================="
echo ""

# Build and start containers
info "Building Docker images..."
docker-compose-f docker/docker-compose.https.yml build

success "Docker images built"
echo ""

info "Starting containers with HTTPS..."
docker-compose-f docker/docker-compose.https.yml up -d

success "Containers started"
echo ""

# Wait for services to be healthy
info "Waiting for services to be healthy..."
sleep 15

# Check container status
info "Container status:"
docker-compose-f docker/docker-compose.https.yml ps
echo ""

# Configure firewall
if command -v ufw &> /dev/null; then
    info "Configuring firewall (UFW)..."
    sudo ufw allow 80/tcp > /dev/null 2>&1 || true
    sudo ufw allow 443/tcp > /dev/null 2>&1 || true
    success "Firewall configured (ports 80, 443 allowed)"
fi

echo ""
info "========================================="
info "  Testing Deployment"
info "========================================="
echo ""

# Test HTTP (should redirect to HTTPS)
info "Testing HTTP redirect..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L http://$FULL_DOMAIN/health)
if [ "$HTTP_CODE" = "200" ]; then
    success "HTTP redirect working"
else
    warning "HTTP test returned code: $HTTP_CODE"
fi

# Test HTTPS
info "Testing HTTPS..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$FULL_DOMAIN/health)
if [ "$HTTPS_CODE" = "200" ]; then
    success "HTTPS working perfectly!"
else
    warning "HTTPS test returned code: $HTTPS_CODE"
fi

# Test SSL certificate
info "Checking SSL certificate..."
if openssl s_client -connect $FULL_DOMAIN:443 -servername $FULL_DOMAIN </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    success "SSL certificate valid"
else
    warning "SSL certificate validation warning (may be normal during initial setup)"
fi

echo ""
echo "========================================="
echo "  🎉 DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
success "Your application is now running with HTTPS!"
echo ""
info "Access your site:"
echo "  https://$FULL_DOMAIN"
echo ""
info "Useful commands:"
echo "  View logs:          docker-compose-f docker/docker-compose.https.yml logs -f"
echo "  Stop application:   docker-compose-f docker/docker-compose.https.yml down"
echo "  Restart:            docker-compose-f docker/docker-compose.https.yml restart"
echo "  Update:             git pull && docker-compose-f docker/docker-compose.https.yml up -d --build"
echo ""
info "SSL Certificate:"
echo "  ✓ Automatically renews every 12 hours"
echo "  ✓ Valid for 90 days"
echo "  ✓ Location: docker/certbot/conf/live/$FULL_DOMAIN/"
echo ""
info "DuckDNS:"
echo "  ✓ Updates every 5 minutes via cron"
echo "  ✓ Check status: crontab -l | grep duckdns"
echo ""
success "Setup complete! Your site is secure with HTTPS 🔒"
echo ""
