# SkillBridge Microservices Platform

A comprehensive platform for skill development and mentoring built with Node.js microservices architecture and Docker containerization.

## 🏗️ Architecture Overview

SkillBridge consists of 5 independent microservices that work together to provide a complete skill development platform:

```
┌─────────────────────────────────────────────────────────────┐
│                    SkillBridge Platform                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Auth Service   │ Booking Service │   Code Review Service   │
│    Port 3001    │    Port 3002    │       Port 3003         │
├─────────────────┼─────────────────┼─────────────────────────┤
│ Messaging Svc   │  User Service   │                         │
│   Port 3004     │   Port 3005     │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 🔧 Services

| Service | Port | Description | Key Features |
|---------|------|-------------|--------------|
| **Auth Service** | 3001 | Authentication & Authorization | JWT tokens, Password hashing, Rate limiting |
| **Booking Service** | 3002 | Session booking management | Calendar integration, Availability management |
| **Code Review Service** | 3003 | Code review and feedback | File uploads, S3 storage, Multi-language support |
| **Messaging Service** | 3004 | Real-time communication | WebSocket, Chat rooms, Message history |
| **User Service** | 3005 | User profile management | Profile data, Skills tracking, User preferences |

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+ recommended)
- **Docker** and **Docker Compose**
- **AWS Account** with DynamoDB and S3 services configured

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd skillbridge-services
```

### 2. Environment Setup

Each service requires its own environment configuration:

```bash
# Copy environment templates for each service
cp auth-service/.env.example auth-service/.env
cp booking-service/.env.example booking-service/.env
cp code-review-service/.env.example code-review-service/.env
cp messaging-service/.env.example messaging-service/.env
cp user-service/.env.example user-service/.env
```

### 3. Configure Environment Variables

Edit each `.env` file with your actual configuration:

**Required for all services:**
- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- AWS region (`AWS_REGION`)
- DynamoDB table names (must match your AWS setup)

**Service-specific requirements:**
- **Auth & Messaging Services**: Generate secure JWT secrets
- **Code Review Service**: S3 bucket name for file storage
- **All Services**: Update CORS origins for your frontend URLs

### 4. Start the Platform

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 5. Verify Services

All services should be running and healthy:

- Auth Service: http://localhost:3001/health
- Booking Service: http://localhost:3002/health
- Code Review Service: http://localhost:3003/health
- Messaging Service: http://localhost:3004/health
- User Service: http://localhost:3005/health

## 🛠️ Development

### Local Development

```bash
# Start specific service for development
cd auth-service
npm install
npm run dev

# Or run all services via Docker
docker-compose up
```

### Making Changes

1. **Service Code**: Edit files in respective service directories
2. **Dependencies**: Update `package.json` in service directories
3. **Environment**: Update `.env` files (never commit real credentials)
4. **Docker**: Modify `Dockerfile` or `docker-compose.yml` as needed

### Adding New Services

1. Create new service directory
2. Add Dockerfile and .dockerignore
3. Create .env and .env.example files
4. Add service to docker-compose.yml
5. Update this README

## 📦 Docker Configuration

### Individual Service Structure

Each service contains:
```
service-name/
├── .env                 # Local configuration (NOT committed)
├── .env.example        # Template (committed to Git)
├── .dockerignore       # Docker build exclusions
├── Dockerfile          # Container definition
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── src/               # Source code
```

### Docker Compose Services

- **Multi-stage builds** for optimized production images
- **Health checks** for service monitoring
- **Service networking** for inter-service communication
- **Environment file loading** for configuration management

## 🗄️ Database & Storage

### DynamoDB Tables

Each service uses dedicated DynamoDB tables:

| Service | Table Name | Purpose |
|---------|------------|---------|
| Auth | skillbridge-auth-college | Authentication records |
| Auth | skillbridge-users-college | User authentication data |
| Booking | skillbridge-bookings-college | Booking records |
| Code Review | skillbridge-code-reviews-college | Code review data |
| Messaging | skillbridge-messages-college | Chat messages |
| Messaging | skillbridge-conversations-college | Conversation threads |
| User | skillbridge-users-college | User profiles |

### S3 Storage

- **Code Review Service**: Stores uploaded code files
- **Bucket**: Configured via `S3_BUCKET_NAME` environment variable

## 🔐 Security

### Environment Variables

- ✅ **Committed**: `.env.example` files with placeholder values
- ❌ **NOT Committed**: `.env` files with real credentials

### JWT Tokens

- **Auth Service**: Issues JWT tokens for authentication
- **Messaging Service**: Validates JWT tokens for WebSocket connections
- **Other Services**: Verify tokens via Auth Service

### CORS Configuration

Configure `CORS_ORIGIN` in each service for your frontend domains.

## 🚦 Service Communication

### API Endpoints

Each service exposes RESTful APIs and health check endpoints:

```bash
# Health checks
GET /health

# Service-specific endpoints
GET /api/auth/...     # Auth Service
GET /api/bookings/... # Booking Service
GET /api/reviews/...  # Code Review Service
GET /api/messages/... # Messaging Service
GET /api/users/...    # User Service
```

### WebSocket (Messaging Service)

Real-time messaging via Socket.IO:
```javascript
// Client connection
const socket = io('http://localhost:3004');
```

## 📊 Monitoring & Logs

### Health Monitoring

```bash
# Check all services
docker-compose ps

# Individual service health
curl http://localhost:3001/health
```

### Logging

```bash
# View all logs
docker-compose logs -f

# Service-specific logs
docker-compose logs -f auth-service
```

## 🔄 CI/CD Ready

This repository structure is designed for:

- **GitOps workflows** (single repository)
- **Docker-based deployments**
- **Kubernetes migration** (future-ready structure)
- **Environment-specific configurations**

## 🤝 Contributing

### Development Workflow

1. **Clone** the repository
2. **Create** feature branch: `git checkout -b feature/your-feature`
3. **Configure** environment variables (copy from `.env.example`)
4. **Develop** your changes
5. **Test** locally with Docker Compose
6. **Commit** changes (ensure no `.env` files are committed)
7. **Push** and create Pull Request

### Code Standards

- **TypeScript** for all services
- **Environment-based** configuration
- **Docker** containerization
- **Health check** endpoints required
- **Comprehensive** logging

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [AWS DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 📝 License

[Add your license information here]

## 📞 Support

For questions or issues:
1. Check service logs: `docker-compose logs [service-name]`
2. Verify environment configuration
3. Ensure AWS services are properly configured
4. Check inter-service connectivity

---

**Note**: This is a development setup. For production deployment, consider additional security measures, load balancing, and monitoring solutions.