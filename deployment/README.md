# Deployment Directory

This directory contains all deployment-related configuration files and documentation.

## Directory Structure

```
deployment/
├── nginx/
│   ├── Dockerfile.nginx    # Nginx container build configuration
│   └── nginx.conf          # Nginx reverse proxy configuration
└── README.md               # This file
```

## nginx/ Directory

Contains NGINX reverse proxy configuration for production deployment.

### [Dockerfile.nginx](nginx/Dockerfile.nginx)
NGINX container configuration:
- Based on `nginx:1.25-alpine`
- Includes `wget` for health checks
- Configured with custom nginx.conf
- Built-in health check endpoint

### [nginx.conf](nginx/nginx.conf)
Reverse proxy configuration:
- Proxies requests to Node.js backend
- Security headers (CSP, HSTS, etc.)
- Gzip compression
- Rate limiting
- Connection pooling
- Health check endpoint

## Usage

### Docker Compose (Recommended)

The nginx service is configured in the root [docker-compose.yml](../docker-compose.yml):

```bash
# Start all services (nginx + backend)
docker-compose up -d

# View nginx logs
docker logs smart-building-nginx -f

# Restart nginx only
docker-compose restart nginx
```

### Manual Docker Build

Build and run nginx separately:

```bash
# Build nginx image
docker build -f deployment/nginx/Dockerfile.nginx -t brico-dave-nginx .

# Run nginx container
docker run -d \
  --name nginx-proxy \
  --network app-network \
  -p 3001:80 \
  brico-dave-nginx
```

### Standalone NGINX

Use the configuration file with an existing nginx installation:

```bash
# Copy configuration
sudo cp deployment/nginx/nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Reload nginx
sudo nginx -s reload
```

## Configuration Details

### Upstream Backend

NGINX proxies to the Node.js backend:
```nginx
upstream backend {
    server weather-dashboard:3001;
    keepalive 32;
}
```

Modify `weather-dashboard:3001` to match your backend location.

### Security Headers

Configured security headers:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Performance Optimization

- **Gzip Compression:** Reduces response sizes
- **Connection Pooling:** Maintains persistent connections
- **Client Body Size:** 10MB limit
- **Timeouts:** Optimized for API responses

### Rate Limiting

Rate limiting zones configured:
- General requests: 10 requests/second
- API requests: 20 requests/second

## SSL/TLS Configuration

### Let's Encrypt Setup

To enable HTTPS with Let's Encrypt:

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Update nginx.conf:**
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       # ... rest of config
   }
   ```

4. **Auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

## Monitoring

### Health Checks

NGINX provides a health check endpoint:
```bash
curl http://localhost:3001/health
```

Docker health check runs automatically every 30 seconds.

### Access Logs

View nginx access logs:
```bash
# Docker
docker logs smart-building-nginx

# Standalone
tail -f /var/log/nginx/access.log
```

### Error Logs

Check nginx error logs:
```bash
# Docker
docker logs smart-building-nginx --tail 100

# Standalone
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### 502 Bad Gateway

Backend is not running or unreachable:
```bash
# Check backend container
docker ps | grep weather-dashboard

# Check network connectivity
docker exec smart-building-nginx wget -O- http://weather-dashboard:3001/health
```

### 413 Request Entity Too Large

Increase client body size in nginx.conf:
```nginx
client_max_body_size 50M;
```

### Configuration Errors

Test nginx configuration:
```bash
# Docker
docker exec smart-building-nginx nginx -t

# Standalone
sudo nginx -t
```

### Performance Issues

Check worker processes and connections:
```nginx
worker_processes auto;  # Use all CPU cores

events {
    worker_connections 2048;  # Increase if needed
}
```

## Advanced Configuration

### Custom Domain

Update server_name in nginx.conf:
```nginx
server {
    server_name your-domain.com www.your-domain.com;
    # ... rest of config
}
```

### Multiple Backends

Load balance across multiple backend instances:
```nginx
upstream backend {
    least_conn;  # Load balancing method
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```

### Caching

Add caching for static assets:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Best Practices

1. **Always test configuration** before deploying:
   ```bash
   nginx -t
   ```

2. **Monitor logs** regularly for errors and unusual activity

3. **Keep nginx updated** for security patches:
   ```bash
   docker pull nginx:1.25-alpine
   docker-compose up -d --build nginx
   ```

4. **Use SSL/TLS** in production with proper certificates

5. **Configure rate limiting** to prevent abuse

6. **Set up monitoring** with tools like Prometheus or Datadog

## See Also

- [NGINX Documentation](https://nginx.org/en/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Full NGINX Guide](../docs/NGINX.md)
