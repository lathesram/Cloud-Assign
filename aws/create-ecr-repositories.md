# Create ECR Repositories

You need to create 4 ECR repositories in AWS Console before the deployment can work.

## Step 1: Go to AWS Console
1. Open AWS Console
2. Go to **Elastic Container Registry (ECR)**
3. Click **Repositories** in the left sidebar

## Step 2: Create Repositories
Click **Create repository** and create these 4 repositories:

### Repository 1: Frontend
- **Repository name**: `skillbridge-frontend`
- **Tag immutability**: Disabled
- **Scan on push**: Enabled (optional)
- Click **Create repository**

### Repository 2: User Service
- **Repository name**: `skillbridge-user-service`
- **Tag immutability**: Disabled
- **Scan on push**: Enabled (optional)
- Click **Create repository**

### Repository 3: Booking Service
- **Repository name**: `skillbridge-booking-service`
- **Tag immutability**: Disabled
- **Scan on push**: Enabled (optional)
- Click **Create repository**

### Repository 4: Code Review Service
- **Repository name**: `skillbridge-code-review-service`
- **Tag immutability**: Disabled
- **Scan on push**: Enabled (optional)
- Click **Create repository**

## Step 3: Verify
After creating all 4, you should see:
- skillbridge-frontend
- skillbridge-user-service
- skillbridge-booking-service
- skillbridge-code-review-service

## Step 4: Re-run Deployment
Once all repositories exist, go back to GitHub Actions and re-run the failed workflow.

---

**Alternative: Create via AWS CLI**
If you have AWS CLI working, you can run:

```bash
aws ecr create-repository --repository-name skillbridge-frontend --region ap-southeast-1
aws ecr create-repository --repository-name skillbridge-user-service --region ap-southeast-1
aws ecr create-repository --repository-name skillbridge-booking-service --region ap-southeast-1
aws ecr create-repository --repository-name skillbridge-code-review-service --region ap-southeast-1
```