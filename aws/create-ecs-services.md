# Create ECS Services

Since your ECS cluster exists but the services might not, you need to create them first.

## Option 1: AWS Console (Recommended)

### Step 1: Go to ECS
1. AWS Console → ECS → Clusters
2. Click on `skillbridge-cluster`
3. Click **Services** tab
4. Click **Create service**

### Step 2: Create Each Service

**Service 1: Frontend App**
- **Launch type**: Fargate
- **Task definition**: `skillbridge-frontend-app:1`
- **Service name**: `frontend-app`
- **Number of tasks**: 1
- **Subnets**: Select available subnets
- **Security groups**: Default VPC security group
- **Auto-assign public IP**: ENABLED
- Click **Create service**

**Service 2: User Service**
- **Launch type**: Fargate  
- **Task definition**: `skillbridge-user-service:1`
- **Service name**: `user-service`
- **Number of tasks**: 1
- **Subnets**: Select available subnets
- **Security groups**: Default VPC security group
- **Auto-assign public IP**: ENABLED
- Click **Create service**

**Service 3: Booking Service**
- **Launch type**: Fargate
- **Task definition**: `skillbridge-booking-service:1` 
- **Service name**: `booking-service`
- **Number of tasks**: 1
- **Subnets**: Select available subnets
- **Security groups**: Default VPC security group
- **Auto-assign public IP**: ENABLED
- Click **Create service**

**Service 4: Code Review Service**
- **Launch type**: Fargate
- **Task definition**: `skillbridge-code-review-service:1`
- **Service name**: `code-review-service`
- **Number of tasks**: 1
- **Subnets**: Select available subnets
- **Security groups**: Default VPC security group
- **Auto-assign public IP**: ENABLED
- Click **Create service**

## Option 2: AWS CLI Commands

```bash
# Create services (run these one by one)
aws ecs create-service \
  --cluster skillbridge-cluster \
  --service-name frontend-app \
  --task-definition skillbridge-frontend-app:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],assignPublicIp=ENABLED}" \
  --region ap-southeast-1

aws ecs create-service \
  --cluster skillbridge-cluster \
  --service-name user-service \
  --task-definition skillbridge-user-service:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],assignPublicIp=ENABLED}" \
  --region ap-southeast-1

aws ecs create-service \
  --cluster skillbridge-cluster \
  --service-name booking-service \
  --task-definition skillbridge-booking-service:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],assignPublicIp=ENABLED}" \
  --region ap-southeast-1

aws ecs create-service \
  --cluster skillbridge-cluster \
  --service-name code-review-service \
  --task-definition skillbridge-code-review-service:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],assignPublicIp=ENABLED}" \
  --region ap-southeast-1
```

---

**Note**: You'll need to replace `subnet-xxx,subnet-yyy` with your actual subnet IDs if using CLI.

After creating the services, re-run the GitHub Actions workflow!