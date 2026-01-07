terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# DynamoDB Tables
resource "aws_dynamodb_table" "tenants" {
  name           = "${var.table_prefix}-tenants"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "${var.table_prefix}-tenants"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "users" {
  name           = "${var.table_prefix}-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "tenant_id"
    type = "S"
  }

  global_secondary_index {
    name     = "email-index"
    hash_key = "email"
  }

  global_secondary_index {
    name     = "tenant-id-index"
    hash_key = "tenant_id"
  }

  tags = {
    Name        = "${var.table_prefix}-users"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "workloads" {
  name           = "${var.table_prefix}-workloads"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "tenant_id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name     = "tenant-id-index"
    hash_key = "tenant_id"
  }

  global_secondary_index {
    name     = "status-index"
    hash_key = "status"
  }

  tags = {
    Name        = "${var.table_prefix}-workloads"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "metrics" {
  name           = "${var.table_prefix}-metrics"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "workload_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  global_secondary_index {
    name            = "workload-id-timestamp-index"
    hash_key        = "workload_id"
    range_key       = "timestamp"
  }

  tags = {
    Name        = "${var.table_prefix}-metrics"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "optimizations" {
  name           = "${var.table_prefix}-optimizations"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "workload_id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name     = "workload-id-index"
    hash_key = "workload_id"
  }

  global_secondary_index {
    name     = "status-index"
    hash_key = "status"
  }

  tags = {
    Name        = "${var.table_prefix}-optimizations"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "documents" {
  name           = "${var.table_prefix}-documents"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "tenant_id"
    type = "S"
  }

  global_secondary_index {
    name     = "tenant-id-index"
    hash_key = "tenant_id"
  }

  tags = {
    Name        = "${var.table_prefix}-documents"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "rag_queries" {
  name           = "${var.table_prefix}-rag-queries"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "tenant_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "N"
  }

  global_secondary_index {
    name            = "tenant-id-created-index"
    hash_key        = "tenant_id"
    range_key       = "created_at"
  }

  tags = {
    Name        = "${var.table_prefix}-rag-queries"
    Environment = var.environment
  }
}

# S3 Bucket for documents
resource "aws_s3_bucket" "documents" {
  bucket = "${var.s3_bucket_prefix}-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "${var.table_prefix}-documents"
    Environment = var.environment
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.table_prefix}-users"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]

  tags = {
    Name        = "${var.table_prefix}-users"
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.table_prefix}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

# Lambda Function
resource "aws_lambda_function" "api" {
  filename         = var.lambda_zip_path
  function_name    = "${var.table_prefix}-api"
  role            = aws_iam_role.lambda.arn
  handler         = "handler.lambda_handler"
  runtime         = "python3.11"
  timeout         = 30
  memory_size     = 512

  environment {
    variables = {
      ENVIRONMENT           = var.environment
      AWS_REGION            = var.aws_region
      DYNAMODB_TABLE_PREFIX = var.table_prefix
      S3_DOCUMENTS_BUCKET   = aws_s3_bucket.documents.id
      COGNITO_USER_POOL_ID  = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID     = aws_cognito_user_pool_client.main.id
    }
  }

  tags = {
    Name        = "${var.table_prefix}-api"
    Environment = var.environment
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name = "${var.table_prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name = "${var.table_prefix}-lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.tenants.arn,
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.workloads.arn,
          aws_dynamodb_table.metrics.arn,
          aws_dynamodb_table.optimizations.arn,
          aws_dynamodb_table.documents.arn,
          aws_dynamodb_table.rag_queries.arn,
          "${aws_dynamodb_table.workloads.arn}/index/*",
          "${aws_dynamodb_table.metrics.arn}/index/*",
          "${aws_dynamodb_table.optimizations.arn}/index/*",
          "${aws_dynamodb_table.documents.arn}/index/*",
          "${aws_dynamodb_table.rag_queries.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.documents.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminCreateUser"
        ]
        Resource = aws_cognito_user_pool.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "*"
      }
    ]
  })
}

# API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.table_prefix}-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api.invoke_arn
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

