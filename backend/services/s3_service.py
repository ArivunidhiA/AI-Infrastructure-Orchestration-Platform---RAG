"""S3 service for document storage"""
import boto3
import uuid
from typing import Optional
from datetime import datetime
from backend.config.settings import get_settings

settings = get_settings()

# Initialize S3 client
s3_client = boto3.client(
    's3',
    region_name=settings.s3_region,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key
)


class S3Service:
    """Service for S3 document operations"""
    
    def __init__(self):
        self.bucket = settings.s3_documents_bucket
        self.client = s3_client
    
    def upload_document(self, file_content: bytes, filename: str, tenant_id: str) -> str:
        """Upload document to S3 and return S3 key"""
        # Generate unique S3 key
        s3_key = f"documents/{tenant_id}/{uuid.uuid4()}/{filename}"
        
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=s3_key,
                Body=file_content,
                ContentType='text/plain',
                Metadata={
                    'tenant_id': tenant_id,
                    'upload_date': datetime.now().isoformat(),
                    'filename': filename
                }
            )
            return s3_key
        except Exception as e:
            print(f"Error uploading to S3: {e}")
            raise
    
    def get_document(self, s3_key: str) -> Optional[bytes]:
        """Retrieve document from S3"""
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=s3_key)
            return response['Body'].read()
        except Exception as e:
            print(f"Error retrieving from S3: {e}")
            return None
    
    def delete_document(self, s3_key: str) -> bool:
        """Delete document from S3"""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=s3_key)
            return True
        except Exception as e:
            print(f"Error deleting from S3: {e}")
            return False
    
    def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> Optional[str]:
        """Generate presigned URL for document download"""
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return url
        except Exception as e:
            print(f"Error generating presigned URL: {e}")
            return None

