#!/bin/bash
# Workaround script for SSL certificate with DNS CAA issues
# This uses nginx webroot method instead of standalone

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

success() { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

DOMAIN="izitdouvaine.duckdns.org"
EMAIL="nathanhad111@gmail.com"

echo "========================================="
echo "  SSL Certificate Workaround Script"
echo "========================================="
echo ""

info "Domain: $DOMAIN"
info "Email: $EMAIL"
echo ""

# Ensure we're in the right directory
cd ~/Page_Daveyzieux

# Create certbot directories
info "Creating certbot directories..."
mkdir -p docker/certbot/conf
mkdir -p docker/certbot/www
success "Directories created"

# Start HTTP version with nginx to serve certbot challenges
info "Starting HTTP nginx for certificate validation..."
docker-compose -f docker/docker-compose.http.yml up -d

# Wait for nginx to be ready
info "Waiting for nginx to start..."
sleep 10

# Try to get certificate using webroot method through running nginx
info "Requesting SSL certificate (webroot method)..."
info "This may take a minute..."

# Create a temporary docker-compose file for certbot
cat > /tmp/certbot-temp.yml <<EOF
version: '3.8'
services:
  certbot-temp:
    image: certbot/certbot:latest
    volumes:
      - $(pwd)/docker/certbot/conf:/etc/letsencrypt
      - $(pwd)/docker/certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot -d $DOMAIN --email $EMAIL --agree-tos --non-interactive --keep-until-expiring
    network_mode: host
EOF

docker-compose -f /tmp/certbot-temp.yml run --rm certbot-temp

if [ $? -eq 0 ]; then
    success "SSL certificate obtained!"

    # Stop HTTP containers
    info "Stopping HTTP containers..."
    docker-compose -f docker/docker-compose.http.yml down

    # Start HTTPS containers
    info "Starting HTTPS deployment..."
    docker-compose -f docker/docker-compose.https.yml up -d --build

    success "HTTPS deployment complete!"
    echo ""
    info "Your app should now be accessible at:"
    info "https://$DOMAIN"
else
    error "Failed to obtain SSL certificate"
    error "Showing nginx logs:"
    docker-compose -f docker/docker-compose.http.yml logs nginx
    exit 1
fi

# Cleanup
rm -f /tmp/certbot-temp.yml
