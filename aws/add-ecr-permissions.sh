# Add ECR permissions to your user via AWS CLI

# Option 1: Attach AWS managed policy (easiest)
aws iam attach-user-policy \
  --user-name Lathesparan \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

# Option 2: Create and attach custom policy
aws iam create-policy \
  --policy-name SkillBridge-ECR-Access \
  --policy-document file://aws/ecr-policy.json

aws iam attach-user-policy \
  --user-name Lathesparan \
  --policy-arn arn:aws:iam::853519595029:policy/SkillBridge-ECR-Access

# Verify the user's policies
aws iam list-attached-user-policies --user-name Lathesparan