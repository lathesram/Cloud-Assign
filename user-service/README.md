# SkillBridge User Service

User management microservice for the SkillBridge platform. This service handles user profiles, mentor/mentee management, and search functionality using AWS DynamoDB.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **AWS Account** with DynamoDB access
3. **AWS CLI** configured or AWS credentials

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AWS Credentials
Create a `.env` file from the template:
```bash
cp .env.example .env
```

Edit the `.env` file with your AWS credentials:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-actual-access-key-id
AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
```

**Important:** Replace `your-actual-access-key-id` and `your-actual-secret-access-key` with your real AWS credentials.

### 3. Create DynamoDB Tables
Run the setup script to create all required DynamoDB tables:
```bash
npm run setup:tables
```

This will create the following tables:
- `skillbridge-users-college` (with email, type, and domain indexes)
- `skillbridge-bookings-college`
- `skillbridge-messages-college`
- `skillbridge-code-reviews-college`

### 4. Start the Service
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

The service will start on `http://localhost:3002` (or the port specified in `.env`).

## API Endpoints

### User Management
- `POST /api/users` - Create new user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Deactivate user
- `GET /api/users/search` - Search users with filters

### Health Check
- `GET /health` - Service health check

## Configuration

All configuration is done through environment variables in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region for DynamoDB | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | Required |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Required |
| `USERS_TABLE_NAME` | DynamoDB users table name | `skillbridge-users-college` |
| `PORT` | Service port | `3002` |
| `AUTH_SERVICE_URL` | Auth service URL for token verification | `http://localhost:3001` |

## DynamoDB Tables Structure

### Users Table
- **Primary Key:** `userId` (String)
- **GSI:** `email-index` (email)
- **GSI:** `type-index` (mentor/mentee type)
- **GSI:** `domain-index` (skill domain)

### Other Tables
- **Bookings:** `bookingId`, GSI on `mentorId` and `menteeId`
- **Messages:** `messageId`, GSI on `conversationId`
- **Code Reviews:** `reviewId`, GSI on `mentorId` and `menteeId`

## Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build TypeScript
npm start          # Start production server
npm run lint       # Run ESLint
npm test           # Run tests
npm run setup:tables  # Create DynamoDB tables
```

### File Structure
```
src/
├── api/
│   ├── controllers/     # Request handlers
│   └── routes/          # Route definitions
├── config/
│   └── dynamodb.ts      # DynamoDB configuration
└── core/
    ├── models/          # Data models & interfaces
    ├── services/        # Business logic
    └── utils/           # Utility functions
```

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Ensure your `.env` file has valid AWS credentials
   - Check that your AWS user has DynamoDB permissions

2. **Table Creation Fails**
   - Verify your AWS region is correct
   - Check if tables already exist in your AWS account

3. **Connection Timeout**
   - Ensure your network allows AWS API calls
   - Check AWS service status

### Getting AWS Credentials

1. Log in to your AWS Console
2. Go to IAM → Users → Your User → Security Credentials
3. Create new Access Key
4. Copy the Access Key ID and Secret Access Key to your `.env` file

### Required AWS Permissions

Your AWS user needs the following DynamoDB permissions:
- `dynamodb:CreateTable`
- `dynamodb:DescribeTable`
- `dynamodb:PutItem`
- `dynamodb:GetItem`
- `dynamodb:UpdateItem`
- `dynamodb:Query`
- `dynamodb:Scan`
- `dynamodb:ListTables`

## College Assignment Notes

This service is configured for college assignment use with:
- Simple local development setup
- Direct AWS DynamoDB integration
- Pre-configured table names with "college" suffix
- Minimal external dependencies
- Clear documentation for setup and usage

Make sure to replace the placeholder AWS credentials in the `.env` file with your actual AWS account credentials before running the service.