variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "table_prefix" {
  description = "Prefix for DynamoDB table names"
  type        = string
  default     = "ai-platform"
}

variable "s3_bucket_prefix" {
  description = "Prefix for S3 bucket name"
  type        = string
  default     = "ai-platform-documents"
}

variable "lambda_zip_path" {
  description = "Path to Lambda deployment package"
  type        = string
  default     = "../lambda-deployment.zip"
}

variable "allowed_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default     = [
    "http://localhost:3000",
    "https://ai-infrastructure-with-rag.netlify.app"
  ]
}

