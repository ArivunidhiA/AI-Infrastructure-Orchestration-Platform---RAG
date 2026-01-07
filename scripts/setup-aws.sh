#!/bin/bash

# Setup AWS resources script
# This script helps set up AWS resources for the AI Infrastructure Platform

set -e

echo "🚀 Setting up AWS resources for AI Infrastructure Platform..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
echo "📋 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS credentials configured"

# Navigate to infrastructure directory
cd "$(dirname "$0")/../infrastructure"

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init

# Plan infrastructure
echo "📝 Planning infrastructure changes..."
terraform plan

# Ask for confirmation
read -p "Do you want to apply these changes? (y/n) " -n 1 -r
echo
if [[ $REY =~ ^[Yy]$ ]]; then
    echo "🚀 Applying infrastructure changes..."
    terraform apply -auto-approve
    
    echo "✅ Infrastructure setup complete!"
    echo ""
    echo "📋 Outputs:"
    terraform output
    
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your .env file with the values from Terraform outputs"
    echo "2. Run './scripts/deploy-lambda.sh' to deploy the Lambda function"
    echo "3. Update your frontend REACT_APP_API_URL with the API Gateway URL"
else
    echo "❌ Setup cancelled"
    exit 1
fi

