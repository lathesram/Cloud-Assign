# SkillBridge Frontend App - Docker Setup

This directory contains the Angular frontend application for the SkillBridge platform, now containerized with Docker.

## Docker Configuration

### Files Added
- `Dockerfile` - Multi-stage build configuration
- `nginx.conf` - Custom Nginx configuration for serving the Angular app
- `.dockerignore` - Optimizes build context by excluding unnecessary files
- `src/environments/environment.docker.ts` - Docker-specific environment configuration

### Build Configuration
The Angular app includes a Docker-specific build configuration that:
- Uses optimized production settings
- Replaces environment files with Docker-specific versions
- Configures API endpoints to work within the Docker network

## Building and Running

### With Docker Compose (Recommended)
```bash
# Build and run all services including the frontend
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs app
```

### Standalone Docker Build
```bash
# Build the image
docker build -t skillbridge-app .

# Run the container
docker run -p 80:80 skillbridge-app
```

## Access Points

- **Frontend App**: http://localhost (port 80)
- **Alternative Port**: http://localhost:4200 (mapped to port 80)
- **Health Check**: http://localhost/health

## Network Configuration

The app runs in the `skillbridge-network` Docker network and can communicate with backend services using their service names:
- `auth-service:3001`
- `user-service:3005` 
- `booking-service:3002`
- `code-review-service:3003`
- `messaging-service:3004`

## Nginx Features

- **SPA Routing**: Handles Angular routing with fallback to index.html
- **Static Asset Caching**: Optimized caching for JS, CSS, and image files
- **Security Headers**: Includes common security headers
- **Gzip Compression**: Reduces payload sizes
- **API Proxy**: Optional proxy configuration for backend services
- **Health Check Endpoint**: `/health` for container health monitoring

## Environment Variables

The Docker environment uses internal service names for API communication. The environment is configured in `src/environments/environment.docker.ts`.

## Development vs Production

- **Development**: Uses `npm start` with live reload
- **Docker**: Uses optimized build with Nginx serving static files
- **Production**: Can be deployed to any container orchestration platform

## Troubleshooting

### Build Issues
- Ensure Node.js dependencies are properly installed
- Check that all environment files exist
- Verify Angular build configuration is valid

### Runtime Issues
- Check container logs: `docker-compose logs app`
- Verify network connectivity to backend services
- Test health endpoint: `curl http://localhost/health`

### Performance
- The app uses multi-stage builds to minimize image size
- Static assets are cached aggressively
- Gzip compression is enabled for better performance