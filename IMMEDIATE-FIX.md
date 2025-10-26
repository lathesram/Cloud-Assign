# IMMEDIATE FIX for Code Review Service

## Problem Summary:
Your service is in a continuous restart loop because:
1. ❌ No security groups (can't communicate)
2. ❌ Configuration validation causing process.exit(1)
3. ❌ Health checks failing too quickly

## Quick Fix via AWS Console:

### Step 1: Update Service Network Configuration
1. Go to: https://ap-southeast-1.console.aws.amazon.com/ecs/home?region=ap-southeast-1#/clusters/skillbridge-cluster/services/code-review-service/configuration
2. Click "Update Service"
3. Under "Networking":
   - Find "Security groups" section
   - Add the default security group for your VPC
4. Click "Update Service"

### Step 2: Check CloudWatch Logs
1. Go to: https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logsV2:log-groups
2. Find: `/ecs/skillbridge-code-review-service`
3. Look for error messages like:
   - "Configuration failed"
   - "Missing required environment variables"
   - "AccessDenied"

### Step 3: Create Missing IAM Role
If you see "AccessDenied" errors:
1. Go to: https://ap-southeast-1.console.aws.amazon.com/iamv2/home?region=ap-southeast-1#/roles
2. Check if `ecsTaskRole` exists
3. If not, create it with these permissions:
   - DynamoDB access to `skillbridge-code-reviews` table
   - S3 access to `skillbridge-code-reviews-bucket`

## Alternative: Force New Deployment
If the above doesn't work:
1. Go to ECS service
2. Click "Update Service" 
3. Check "Force new deployment"
4. Click "Update Service"

## What I've Fixed in Code:
✅ Added security group configuration to workflow
✅ Made configuration validation non-fatal
✅ Increased health check startup period to 120 seconds
✅ Added more retries for health checks

## Next Steps:
1. Apply the immediate console fixes above
2. Push the code changes I made
3. Monitor the service for successful startup