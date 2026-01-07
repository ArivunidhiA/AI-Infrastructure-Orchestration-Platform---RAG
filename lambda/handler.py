"""Lambda handler for FastAPI application"""
import json
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from mangum import Mangum
from backend.main import app

# Create Mangum handler for FastAPI
handler = Mangum(app, lifespan="off")


def lambda_handler(event, context):
    """AWS Lambda handler"""
    try:
        # Handle the request
        response = handler(event, context)
        return response
    except Exception as e:
        # Return error response
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }

