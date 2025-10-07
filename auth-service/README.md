# Auth Service

Authentication and authorization service for the SkillBridge platform.

## Features

- User registration (mentors and mentees)
- JWT-based authentication
- Password hashing with bcrypt
- Token verification
- Rate limiting
- Input validation
- Role-based access control
- DynamoDB persistence (users table with email GSI)

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "type": "mentor" // or "mentee"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Verify Token
```http
POST /api/auth/verify-token
Authorization: Bearer <jwt_token>
```

#### Health Check
```http
GET /api/auth/health
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`

4. Start development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `DYNAMODB_ENDPOINT` | DynamoDB endpoint (only for local) | `http://localhost:8000` |
| `USERS_TABLE_NAME` | Users table name | `skillbridge-users-dev` |
| `USER_EMAIL_GSI_NAME` | GSI name for querying by email | `email-index` |
| `USE_IN_MEMORY_DB` | Use in-memory fallback instead of DynamoDB | `false` |

## DynamoDB Data Model

Users Table (default name `skillbridge-users-dev`):
- Partition Key (PK): `userId` (string, UUID v4)
- Attributes: `email` (string, unique via GSI), `passwordHash`, `type`, `name`, `createdAt`, `updatedAt`, `isActive`
- Global Secondary Index: `email-index`
  - Partition Key: `email`
  - Projection: `ALL`

Example AWS CLI commands to create table & GSI:
```bash
aws dynamodb create-table \
  --table-name skillbridge-users-dev \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{"IndexName":"email-index","KeySchema":[{"AttributeName":"email","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]'
```

Describe to verify:
```bash
aws dynamodb describe-table --table-name skillbridge-users-dev
```

### Local Development with DynamoDB Local

1. Run DynamoDB Local via Docker:
```bash
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
```

2. Create table against local endpoint:
```bash
aws dynamodb create-table \
  --table-name skillbridge-users-dev \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{"IndexName":"email-index","KeySchema":[{"AttributeName":"email","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --endpoint-url http://localhost:8000
```

3. Seed / test query:
```bash
aws dynamodb scan --table-name skillbridge-users-dev --endpoint-url http://localhost:8000
```

4. Set env vars in `.env`:
```
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
USERS_TABLE_NAME=skillbridge-users-dev
USER_EMAIL_GSI_NAME=email-index
```

### CloudFormation Snippet
```yaml
Resources:
  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: skillbridge-users-${Stage}
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: email
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
      GlobalSecondaryIndexes:
        - IndexName: email-index
          KeySchema:
            - AttributeName: email
              KeyType: HASH
          Projection:
            ProjectionType: ALL
```

### Terraform Snippet
```hcl
resource "aws_dynamodb_table" "users" {
  name         = "skillbridge-users-${var.stage}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }
}
```

## Refresh Tokens (Planned)
Currently only access tokens are issued. You can extend the model with a `refreshTokens` table keyed by `userId#tokenId` with TTL.

## Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (@$!%*?&)

## Rate Limiting

- Authentication endpoints: 10 requests per 15 minutes per IP
- Token verification: 5 requests per 15 minutes per IP

## Development

### Running Tests
```bash
npm test
```

### Building
```bash
npm run build
```

### Production
```bash
npm start
```