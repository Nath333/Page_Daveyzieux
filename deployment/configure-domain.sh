#!/bin/bash
# Configure DuckDNS domain in nginx-ssl.conf

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}ℹ${NC} $1"; }

echo "========================================="
echo "  Configure DuckDNS Domain"
echo "========================================="
echo ""

# Check if nginx-ssl.conf exists
if [ ! -f "deployment/nginx/nginx-ssl.conf" ]; then
    echo "Error: deployment/nginx/nginx-ssl.conf not found"
    exit 1
fi

# Get domain from user
read -p "Enter your DuckDNS domain (without .duckdns.org): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "Error: Domain cannot be empty"
    exit 1
fi

FULL_DOMAIN="${DOMAIN}.duckdns.org"

echo ""
info "Configuring nginx-ssl.conf with domain: $FULL_DOMAIN"
echo ""

# Create backup
cp deployment/nginx/nginx-ssl.conf deployment/nginx/nginx-ssl.conf.backup
success "Created backup: deployment/nginx/nginx-ssl.conf.backup"

# Replace domain in config
sed -i "s/YOUR_DOMAIN\.duckdns\.org/$FULL_DOMAIN/g" deployment/nginx/nginx-ssl.conf

success "Updated nginx-ssl.conf with domain: $FULL_DOMAIN"
echo ""

# Show what was changed
info "Changes made:"
echo "  server_name: $FULL_DOMAIN"
echo "  ssl_certificate: /etc/letsencrypt/live/$FULL_DOMAIN/fullchain.pem"
echo "  ssl_certificate_key: /etc/letsencrypt/live/$FULL_DOMAIN/privkey.pem"
echo "  ssl_trusted_certificate: /etc/letsencrypt/live/$FULL_DOMAIN/chain.pem"
echo ""

success "Configuration complete!"
echo ""
info "Next steps:"
echo "  1. Make sure port 80 and 443 are open"
echo "  2. Update your DuckDNS domain to point to this server"
echo "  3. Run: ./deploy-https.sh"
echo ""
