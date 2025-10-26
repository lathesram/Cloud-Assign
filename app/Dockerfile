# Builder stage for Angular compilation
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev) for building
RUN npm ci

# Copy source code
COPY . .

# Build the Angular application for production
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Remove default nginx files completely
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/app/browser /usr/share/nginx/html

# List what's copied for debugging
RUN ls -la /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]