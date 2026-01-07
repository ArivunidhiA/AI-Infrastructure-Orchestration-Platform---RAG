#!/bin/bash

# Deploy Lambda function script
# This script packages and deploys the Lambda function to AWS

set -e

echo "📦 Packaging Lambda function..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
LAMBDA_DIR="$TEMP_DIR/lambda"

# Copy backend code
mkdir -p "$LAMBDA_DIR"
cp -r backend "$LAMBDA_DIR/"
cp lambda/handler.py "$LAMBDA_DIR/"
cp lambda/requirements.txt "$LAMBDA_DIR/"

# Install dependencies
echo "📥 Installing Python dependencies..."
cd "$LAMBDA_DIR"
pip install -r requirements.txt -t . --quiet

# Create deployment package
echo "📦 Creating deployment package..."
cd "$TEMP_DIR"
zip -r lambda-deployment.zip lambda/ -q

# Move to project root
cd "$(dirname "$0")/.."
mv "$TEMP_DIR/lambda-deployment.zip" .

# Deploy using Terraform (if infrastructure is set up)
if [ -d "infrastructure" ] && [ -f "infrastructure/.terraform/terraform.tfstate" ]; then
    echo "🚀 Deploying Lambda function..."
    cd infrastructure
    terraform apply -auto-approve -var="lambda_zip_path=../lambda-deployment.zip"
    echo "✅ Lambda function deployed!"
else
    echo "⚠️  Infrastructure not set up. Please run './scripts/setup-aws.sh' first."
    echo "📦 Lambda package created at: lambda-deployment.zip"
    echo "   You can manually upload this to AWS Lambda"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo "✅ Deployment complete!"

