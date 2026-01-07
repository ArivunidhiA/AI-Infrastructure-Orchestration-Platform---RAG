# AWS Setup Guide

Complete guide for setting up AWS services for the AI Infrastructure Platform.

## AWS Account Setup

1. **Create AWS Account**
   - Go to https://aws.amazon.com/
   - Sign up for a new account
   - Complete verification

2. **Create IAM User**
   - Go to IAM Console
   - Create new user: `ai-platform-deployer`
   - Attach policies:
     - `AdministratorAccess` (for initial setup)
     - Or create custom policy with required permissions
   - Create access keys
   - Save credentials securely

3. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter Access Key ID
   # Enter Secret Access Key
   # Enter region: us-east-1
   # Enter output format: json
   ```

## Required AWS Services

### 1. DynamoDB (Database)
- **Free Tier**: 25GB storage, 25 read/write units
- **Always-on**: Yes, no auto-shutdown
- **Cost**: Free within limits, then pay-per-request

### 2. S3 (Document Storage)
- **Free Tier**: 5GB storage, 20K GET requests
- **Always-on**: Yes
- **Cost**: Free within limits

### 3. Lambda (Backend API)
- **Free Tier**: 1M requests/month, 400K GB-seconds
- **Always-on**: Yes (no cold start issues with API Gateway)
- **Cost**: Free within limits

### 4. API Gateway (API Endpoint)
- **Free Tier**: 1M requests/month
- **Always-on**: Yes
- **Cost**: Free within limits

### 5. Cognito (Authentication)
- **Free Tier**: 50K Monthly Active Users
- **Always-on**: Yes
- **Cost**: Free within limits

### 6. CloudWatch (Logging)
- **Free Tier**: 5GB log ingestion, 10 custom metrics
- **Always-on**: Yes
- **Cost**: Free within limits

## Optional Services

### Pinecone (Vector Search)
- **Free Tier**: 100K vectors
- **External Service**: Not AWS, but recommended
- **Cost**: Free tier available

### AWS Bedrock (LLM)
- **No Free Tier**: Pay-per-use
- **Cost**: Very low (~$0.008 per 1K tokens)
- **Alternative**: Use mock responses for portfolio

## Service Creation Steps

### Automatic (Recommended)

Use Terraform to create all services:

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Manual (If Needed)

#### DynamoDB Tables

1. Go to DynamoDB Console
2. Create tables with these names:
   - `ai-platform-tenants`
   - `ai-platform-users`
   - `ai-platform-workloads`
   - `ai-platform-metrics`
   - `ai-platform-optimizations`
   - `ai-platform-documents`
   - `ai-platform-rag-queries`
3. Set billing mode: **Pay per request**
4. Add Global Secondary Indexes as needed

#### S3 Bucket

1. Go to S3 Console
2. Create bucket: `ai-platform-documents-XXXXX`
3. Enable versioning
4. Enable encryption (AES256)
5. Set public access: Block all

#### Cognito User Pool

1. Go to Cognito Console
2. Create user pool: `ai-platform-users`
3. Configure:
   - Sign-in options: Email
   - Password policy: 8+ chars, mixed case, numbers, symbols
   - MFA: Optional
4. Create app client
5. Note User Pool ID and Client ID

#### Lambda Function

1. Go to Lambda Console
2. Create function: `ai-platform-api`
3. Runtime: Python 3.11
4. Upload deployment package
5. Set handler: `handler.lambda_handler`
6. Set timeout: 30 seconds
7. Set memory: 512 MB
8. Configure environment variables (from `.env`)

#### API Gateway

1. Go to API Gateway Console
2. Create HTTP API
3. Add integration: Lambda function
4. Configure CORS
5. Deploy to stage
6. Note API endpoint URL

## IAM Permissions

The Lambda function needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/ai-platform-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::ai-platform-documents-*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminCreateUser"
      ],
      "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    }
  ]
}
```

## Cost Monitoring

### Set Up Billing Alerts

1. Go to AWS Billing Dashboard
2. Create budget:
   - Budget amount: $10/month
   - Alert threshold: 80%
   - Email notifications

### Monitor Usage

- **DynamoDB**: Check table metrics in DynamoDB Console
- **Lambda**: Check invocations in CloudWatch
- **S3**: Check storage usage in S3 Console
- **API Gateway**: Check request count in API Gateway Console

## Free Tier Limits Summary

| Service | Free Tier | Always-On |
|---------|-----------|-----------|
| DynamoDB | 25GB storage | ✅ Yes |
| S3 | 5GB storage | ✅ Yes |
| Lambda | 1M requests/month | ✅ Yes |
| API Gateway | 1M requests/month | ✅ Yes |
| Cognito | 50K MAU | ✅ Yes |
| CloudWatch | 5GB logs | ✅ Yes |

**Total Estimated Cost**: $0-5/month (within free tier)

## Troubleshooting

### "Access Denied" Errors

- Check IAM role permissions
- Verify AWS credentials are configured
- Ensure Lambda has correct IAM role attached

### "Table Not Found" Errors

- Verify DynamoDB tables exist
- Check table names match configuration
- Ensure tables are in correct region

### "Bucket Not Found" Errors

- Verify S3 bucket exists
- Check bucket name in configuration
- Ensure bucket is in correct region

### High Costs

- Check CloudWatch metrics
- Review DynamoDB usage
- Monitor Lambda invocations
- Set up billing alerts

## Security Best Practices

1. **Never commit AWS credentials** to git
2. **Use IAM roles** instead of access keys when possible
3. **Enable MFA** on AWS account
4. **Use least privilege** IAM policies
5. **Enable CloudTrail** for audit logging
6. **Encrypt S3 buckets** and DynamoDB tables
7. **Use VPC** for Lambda if handling sensitive data
8. **Rotate credentials** regularly

## Next Steps

After AWS setup:
1. Run `./scripts/setup-aws.sh` to deploy infrastructure
2. Update `.env` with service endpoints
3. Deploy Lambda: `./scripts/deploy-lambda.sh`
4. Update frontend API URL
5. Test deployment

