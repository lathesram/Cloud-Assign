# Create ECS Task Execution Role

## Step 1: Go to IAM Console
1. AWS Console → IAM → Roles
2. Click **Create role**

## Step 2: Select Trusted Entity
- **Trusted entity type**: AWS service
- **Service or use case**: Elastic Container Service
- **Use case**: Elastic Container Service Task
- Click **Next**

## Step 3: Add Permissions
Search for and select:
- ✅ **AmazonECSTaskExecutionRolePolicy**
- Click **Next**

## Step 4: Name and Create
- **Role name**: `ecsTaskExecutionRole`
- **Description**: "Allows ECS tasks to call AWS services"
- Click **Create role**

## Alternative: AWS CLI Command
```bash
# Create the role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach the policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

After creating this role, re-run the GitHub Actions deployment!