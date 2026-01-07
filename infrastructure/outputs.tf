output "api_gateway_url" {
  description = "API Gateway URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

output "s3_bucket_name" {
  description = "S3 bucket name for documents"
  value       = aws_s3_bucket.documents.id
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    tenants      = aws_dynamodb_table.tenants.name
    users        = aws_dynamodb_table.users.name
    workloads    = aws_dynamodb_table.workloads.name
    metrics      = aws_dynamodb_table.metrics.name
    optimizations = aws_dynamodb_table.optimizations.name
    documents    = aws_dynamodb_table.documents.name
    rag_queries  = aws_dynamodb_table.rag_queries.name
  }
}

