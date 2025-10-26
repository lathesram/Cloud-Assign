# Add all required permissions for ECS deployment

# ECS Full Access (for task definitions, services, clusters)
aws iam attach-user-policy \
  --user-name Lathesparan \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

# CloudWatch Logs (for creating log groups)
aws iam attach-user-policy \
  --user-name Lathesparan \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# EC2 Read Only (for VPC/subnet discovery)
aws iam attach-user-policy \
  --user-name Lathesparan \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess

# IAM PassRole (for ECS task execution role)
aws iam attach-user-policy \
  --user-name Lathesparan \
  --policy-arn arn:aws:iam::aws:policy/IAMReadOnlyAccess

# Verify all attached policies
aws iam list-attached-user-policies --user-name Lathesparan