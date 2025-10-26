# AWS Setup Diagnostic Checklist

## 1. Check ECR Repositories
Go to AWS Console → ECR → Repositories
✅ Should see exactly these 4 repositories:
- skillbridge-frontend-app
- skillbridge-booking-service  
- skillbridge-user-service
- skillbridge-code-review-service

## 2. Check ECS Cluster
Go to AWS Console → ECS → Clusters
✅ Should see: `skillbridge-cluster`

## 3. Check IAM Role
Go to AWS Console → IAM → Roles
✅ Search for: `ecsTaskExecutionRole`
✅ Should have these policies attached:
- AmazonECSTaskExecutionRolePolicy

## 4. Check GitHub Secrets
Go to GitHub repo → Settings → Secrets and variables → Actions
✅ Should have these secrets:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY  
- AWS_REGION (value: ap-southeast-1)

## 5. Check AWS User Permissions
Your AWS user should have these permissions:
- ECR: Full access (or ecr:*)
- ECS: Full access (or ecs:*)
- EC2: Describe permissions (for VPC/subnet discovery)
- CloudWatch Logs: Create log groups
- IAM: Pass role (for ecsTaskExecutionRole)

## 6. Common Error Messages & Solutions

### "Repository does not exist"
- **Problem**: ECR repository not created
- **Solution**: Create missing ECR repositories

### "User is not authorized to perform: sts:AssumeRole" 
- **Problem**: ecsTaskExecutionRole doesn't exist or wrong permissions
- **Solution**: Create the role or fix permissions

### "AccessDenied" or "UnauthorizedOperation"
- **Problem**: AWS credentials invalid or insufficient permissions
- **Solution**: Check GitHub Secrets and AWS user permissions

### "InvalidParameterException: Invalid subnet"
- **Problem**: No default VPC or subnets
- **Solution**: Use specific subnet IDs

---

## Quick Test Commands

If you have AWS CLI working, test these:

```bash
# Test ECR access
aws ecr describe-repositories --region ap-southeast-1

# Test ECS access  
aws ecs describe-clusters --clusters skillbridge-cluster --region ap-southeast-1

# Test IAM role
aws iam get-role --role-name ecsTaskExecutionRole

# Test VPC discovery
aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region ap-southeast-1
```