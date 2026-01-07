"""Configuration management for the application"""
import os
from typing import List, Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback for older pydantic
    from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    app_name: str = "AI Infrastructure Orchestration Platform"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # AWS Configuration
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    aws_access_key_id: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    
    # Database (DynamoDB)
    dynamodb_table_prefix: str = os.getenv("DYNAMODB_TABLE_PREFIX", "ai-platform")
    dynamodb_endpoint_url: Optional[str] = os.getenv("DYNAMODB_ENDPOINT_URL")  # For local testing
    
    # S3
    s3_documents_bucket: str = os.getenv("S3_DOCUMENTS_BUCKET", "ai-platform-documents")
    s3_region: str = os.getenv("S3_REGION", "us-east-1")
    
    # Cognito
    cognito_user_pool_id: Optional[str] = os.getenv("COGNITO_USER_POOL_ID")
    cognito_client_id: Optional[str] = os.getenv("COGNITO_CLIENT_ID")
    cognito_region: str = os.getenv("COGNITO_REGION", "us-east-1")
    
    # Pinecone (Vector Search)
    pinecone_api_key: Optional[str] = os.getenv("PINECONE_API_KEY")
    pinecone_environment: Optional[str] = os.getenv("PINECONE_ENVIRONMENT")
    pinecone_index_name: str = os.getenv("PINECONE_INDEX_NAME", "ai-platform-documents")
    
    # AWS Bedrock
    bedrock_model_id: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-v2")
    bedrock_region: str = os.getenv("BEDROCK_REGION", "us-east-1")
    bedrock_embedding_model: str = os.getenv("BEDROCK_EMBEDDING_MODEL", "amazon.titan-embed-text-v1")
    
    # OpenAI
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    openai_embedding_model: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    
    # OpenSearch (Alternative to Pinecone)
    opensearch_endpoint: Optional[str] = os.getenv("OPENSEARCH_ENDPOINT")
    opensearch_user: Optional[str] = os.getenv("OPENSEARCH_USER")
    opensearch_password: Optional[str] = os.getenv("OPENSEARCH_PASSWORD")
    
    # CORS
    allowed_origins: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,https://ai-infrastructure-with-rag.netlify.app"
    ).split(",")
    
    # Feature Flags
    use_mock_data: bool = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
    use_pinecone: bool = os.getenv("USE_PINECONE", "true").lower() == "true"
    use_bedrock: bool = os.getenv("USE_BEDROCK", "false").lower() == "true"
    use_openai: bool = os.getenv("USE_OPENAI", "true").lower() == "true"
    enable_cloudwatch: bool = os.getenv("ENABLE_CLOUDWATCH", "false").lower() == "true"
    
    # CloudWatch
    cloudwatch_log_group: str = os.getenv("CLOUDWATCH_LOG_GROUP", "ai-platform-logs")
    
    # Secrets Manager
    db_secret_name: Optional[str] = os.getenv("DB_SECRET_NAME")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

