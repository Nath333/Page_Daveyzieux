# Nginx with SSL/HTTPS support for Page Daveyzieux
FROM nginx:1.25-alpine

# Install wget and openssl for health checks and SSL
RUN apk add --no-cache wget openssl

# Copy nginx HTTPS configuration
COPY docker/nginx/https/nginx.conf /etc/nginx/nginx.conf

# Create directory for certbot challenges
RUN mkdir -p /var/www/certbot

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
