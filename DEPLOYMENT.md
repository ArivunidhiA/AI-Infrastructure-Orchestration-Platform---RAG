# Deployment Guide

This guide walks you through deploying the AI Infrastructure Orchestration Platform to AWS.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured (`aws configure`)
3. **Terraform** >= 1.0 installed
4. **Python** 3.11+ installed
5. **Node.js** 16+ and npm installed

## Step 1: Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter output format (json)
```

## Step 2: Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your AWS credentials and service configurations.

## Step 3: Deploy AWS Infrastructure

Run the setup script to create all AWS resources:

```bash
./scripts/setup-aws.sh
```

This will:
- Create DynamoDB tables
- Create S3 bucket for documents
- Create Cognito user pool
- Create Lambda function
- Create API Gateway
- Set up IAM roles and policies

**Note:** The script uses Terraform. Review the plan before applying.

## Step 4: Update Environment Variables

After infrastructure is created, update your `.env` file with the values from Terraform outputs:

```bash
cd infrastructure
terraform output
```

Update these values in `.env`:
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `S3_DOCUMENTS_BUCKET`
- `AWS_REGION`

## Step 5: Deploy Lambda Function

Package and deploy the Lambda function:

```bash
./scripts/deploy-lambda.sh
```

This will:
- Package the backend code and dependencies
- Deploy to AWS Lambda
- Update API Gateway integration

## Step 6: Update Frontend API URL

Get the API Gateway URL:

```bash
cd infrastructure
terraform output api_gateway_url
```

Update your frontend `.env` or build configuration:

```bash
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com
```

## Step 7: Deploy Frontend

### Option A: Netlify (Current)

1. Push to GitHub
2. Connect repository to Netlify
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/build`
5. Add environment variable: `REACT_APP_API_URL` = your API Gateway URL

### Option B: S3 + CloudFront (AWS)

```bash
cd frontend
npm install
npm run build

# Upload to S3
aws s3 sync build/ s3://your-frontend-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Step 8: Configure Pinecone (Optional)

1. Sign up at [Pinecone](https://www.pinecone.io/)
2. Create an index named `ai-platform-documents` with dimension 1536
3. Add your API key to `.env`:
   ```
   PINECONE_API_KEY=your-api-key
   PINECONE_ENVIRONMENT=us-east-1
   ```

## Step 9: Configure AWS Bedrock (Optional)

1. Enable Bedrock in your AWS account
2. Request access to Claude models
3. Update `.env`:
   ```
   USE_BEDROCK=true
   BEDROCK_MODEL_ID=anthropic.claude-v2
   ```

## Step 10: Test Deployment

1. Visit your frontend URL
2. Check browser console for errors
3. Test API endpoints:
   ```bash
   curl https://your-api-gateway-url/health
   ```

## Troubleshooting

### Lambda Function Errors

Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/ai-platform-api --follow
```

### API Gateway CORS Issues

Verify CORS configuration in `infrastructure/main.tf` matches your frontend URL.

### DynamoDB Access Denied

Check IAM role permissions in `infrastructure/main.tf`.

### Frontend Shows Mock Data

- Check backend health: `curl https://your-api/health`
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors

## Cost Monitoring

Set up billing alerts in AWS:
1. Go to AWS Billing Dashboard
2. Create budget alert for $10/month (or your limit)
3. Monitor usage in CloudWatch

## Free Tier Limits

- **Lambda**: 1M requests/month free
- **API Gateway**: 1M requests/month free
- **DynamoDB**: 25GB storage free forever
- **S3**: 5GB storage free forever
- **Cognito**: 50K MAU free forever
- **CloudWatch Logs**: 5GB ingestion free forever

## Maintenance

### Update Lambda Function

```bash
./scripts/deploy-lambda.sh
```

### Update Infrastructure

```bash
cd infrastructure
terraform plan
terraform apply
```

### View Logs

```bash
aws logs tail /aws/lambda/ai-platform-api --follow
```

## Rollback

If something goes wrong:

```bash
cd infrastructure
terraform destroy
```

**Warning:** This will delete all resources. Make sure you have backups if needed.

