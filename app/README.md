# SkillBridge Frontend App - Docker Configuration

This directory contains the Angular frontend application for the SkillBridge platform, containerized with Docker following the same patterns as the backend services.

## Docker Architecture

### Multi-stage Build
- **Stage 1 (Builder)**: Node.js 18 Alpine - Compiles the Angular application
- **Stage 2 (Production)**: Nginx Alpine - Serves the static files with optimized configuration

### Security Features
- Non-root user execution (nginxuser:1001)
- Security headers (XSS protection, Content-Type options, etc.)
- Proper file ownership and permissions

## Configuration Files

### `Dockerfile`
- Multi-stage build following the same pattern as backend services
- Uses Node.js 18 Alpine for building
- Uses Nginx Alpine for production serving
- Includes health checks and security configurations

### `nginx.conf`
- Custom Nginx configuration optimized for Angular SPA
- API proxying to backend services
- WebSocket support for real-time messaging
- Static asset caching and Gzip compression
- Health check endpoint at `/health`

### `.dockerignore`
- Optimizes build context by excluding unnecessary files
- Reduces image size and build time

### Environment Configuration
- `environment.docker.ts` - Docker-specific environment settings
- Uses Nginx proxy paths for API calls (`/api/*`)
- Configured for internal Docker network communication

## API Routing

The Nginx configuration includes proxy rules for all backend services:

- `/api/auth/*` → `auth-service:3001`
- `/api/users/*` → `user-service:3005`
- `/api/bookings/*` → `booking-service:3002`
- `/api/reviews/*` → `code-review-service:3003`
- `/api/messages/*` → `messaging-service:3004`
- `/socket.io/*` → `messaging-service:3004` (WebSocket)

## Docker Compose Integration

The app service in `docker-compose.yml`:
- Exposes port 80 for HTTP traffic
- Depends on all backend services
- Includes health checks and logging
- Connected to the `skillbridge-network`

## Build Commands

```bash
# Build using Docker Compose (recommended)
docker-compose build app

# Build standalone
docker build -t skillbridge-app ./app

# Run all services
docker-compose up -d

# View app logs
docker-compose logs app
```

## Access Points

- **Frontend Application**: http://localhost
- **Health Check**: http://localhost/health
- **API Endpoints**: http://localhost/api/*

## Development vs Production

- **Development**: Use `npm start` for live reload and development server
- **Docker**: Optimized production build served by Nginx
- **Environment**: Uses Docker-specific configuration with proxy paths

## Troubleshooting

### Build Issues
- Ensure all dependencies are properly defined in package.json
- Check that Angular build configuration is valid
- Verify environment files exist

### Runtime Issues
- Check container logs: `docker-compose logs app`
- Test health endpoint: `curl http://localhost/health`
- Verify backend services are running and accessible

### Network Issues
- Ensure all services are on the same Docker network
- Check service names match those used in nginx.conf
- Verify port configurations in docker-compose.yml