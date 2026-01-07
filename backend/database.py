"""Database module with DynamoDB client and table definitions"""
import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional, Dict, Any
from backend.config.settings import get_settings

settings = get_settings()

# Initialize DynamoDB client
dynamodb_client = boto3.client(
    'dynamodb',
    region_name=settings.aws_region,
    endpoint_url=settings.dynamodb_endpoint_url,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key
)

dynamodb_resource = boto3.resource(
    'dynamodb',
    region_name=settings.aws_region,
    endpoint_url=settings.dynamodb_endpoint_url,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key
)

# Table names
TABLES = {
    'tenants': f"{settings.dynamodb_table_prefix}-tenants",
    'users': f"{settings.dynamodb_table_prefix}-users",
    'workloads': f"{settings.dynamodb_table_prefix}-workloads",
    'metrics': f"{settings.dynamodb_table_prefix}-metrics",
    'optimizations': f"{settings.dynamodb_table_prefix}-optimizations",
    'documents': f"{settings.dynamodb_table_prefix}-documents",
    'rag_queries': f"{settings.dynamodb_table_prefix}-rag-queries",
}


def get_table(table_name: str):
    """Get DynamoDB table resource"""
    full_table_name = TABLES.get(table_name, table_name)
    return dynamodb_resource.Table(full_table_name)


def create_tables():
    """Create all DynamoDB tables if they don't exist"""
    table_definitions = {
        'tenants': {
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        'users': {
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'email', 'AttributeType': 'S'},
                {'AttributeName': 'tenant_id', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST',
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'email-index',
                    'KeySchema': [
                        {'AttributeName': 'email', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'tenant-id-index',
                    'KeySchema': [
                        {'AttributeName': 'tenant_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ]
        },
        'workloads': {
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'tenant_id', 'AttributeType': 'S'},
                {'AttributeName': 'status', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST',
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'tenant-id-index',
                    'KeySchema': [
                        {'AttributeName': 'tenant_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'status-index',
                    'KeySchema': [
                        {'AttributeName': 'status', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ]
        },
        'metrics': {
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'workload_id', 'AttributeType': 'S'},
                {'AttributeName': 'timestamp', 'AttributeType': 'N'}
            ],
            'BillingMode': 'PAY_PER_REQUEST',
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'workload-id-timestamp-index',
                    'KeySchema': [
                        {'AttributeName': 'workload_id', 'KeyType': 'HASH'},
                        {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ]
        },
        'optimizations': {
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'workload_id', 'AttributeType': 'S'},
                {'AttributeName': 'status', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST',
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'workload-id-index',
                    'KeySchema': [
                        {'AttributeName': 'workload_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'status-index',
                    'KeySchema': [
                        {'AttributeName': 'status', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ]
        },
        'documents': {
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'tenant_id', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST',
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'tenant-id-index',
                    'KeySchema': [
                        {'AttributeName': 'tenant_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ]
        },
        'rag_queries': {
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'tenant_id', 'AttributeType': 'S'},
                {'AttributeName': 'created_at', 'AttributeType': 'N'}
            ],
            'BillingMode': 'PAY_PER_REQUEST',
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'tenant-id-created-index',
                    'KeySchema': [
                        {'AttributeName': 'tenant_id', 'KeyType': 'HASH'},
                        {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ]
        }
    }
    
    for table_name, table_def in table_definitions.items():
        full_table_name = TABLES[table_name]
        try:
            # Check if table exists
            dynamodb_client.describe_table(TableName=full_table_name)
            print(f"Table {full_table_name} already exists")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                # Create table
                try:
                    dynamodb_client.create_table(
                        TableName=full_table_name,
                        **table_def
                    )
                    print(f"Created table {full_table_name}")
                except Exception as create_error:
                    print(f"Error creating table {full_table_name}: {create_error}")
            else:
                print(f"Error checking table {full_table_name}: {e}")


def init_sample_data():
    """Initialize sample data for development"""
    try:
        tenants_table = get_table('tenants')
        
        # Check if default tenant exists
        try:
            tenants_table.get_item(Key={'id': 'default-tenant'})
            print("Sample data already exists")
            return
        except:
            pass
        
        # Create default tenant
        tenants_table.put_item(Item={
            'id': 'default-tenant',
            'name': 'Default Tenant',
            'created_at': str(int(__import__('time').time()))
        })
        
        # Create sample workloads
        workloads_table = get_table('workloads')
        import uuid
        import time
        
        sample_workloads = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Image Classification Model',
                'type': 'inference',
                'status': 'running',
                'cpu_cores': 8,
                'gpu_count': 2,
                'memory_gb': 32.0,
                'cost_per_hour': 2.50,
                'tenant_id': 'default-tenant',
                'created_at': str(int(time.time())),
                'updated_at': str(int(time.time()))
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'NLP Model Inference',
                'type': 'inference',
                'status': 'running',
                'cpu_cores': 4,
                'gpu_count': 1,
                'memory_gb': 16.0,
                'cost_per_hour': 1.80,
                'tenant_id': 'default-tenant',
                'created_at': str(int(time.time())),
                'updated_at': str(int(time.time()))
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Recommendation System',
                'type': 'training',
                'status': 'running',
                'cpu_cores': 16,
                'gpu_count': 0,
                'memory_gb': 64.0,
                'cost_per_hour': 1.20,
                'tenant_id': 'default-tenant',
                'created_at': str(int(time.time())),
                'updated_at': str(int(time.time()))
            }
        ]
        
        for workload in sample_workloads:
            workloads_table.put_item(Item=workload)
        
        print("Sample data initialized successfully")
    except Exception as e:
        print(f"Error initializing sample data: {e}")

