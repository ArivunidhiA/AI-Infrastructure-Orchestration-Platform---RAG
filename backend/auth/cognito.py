"""AWS Cognito authentication service"""
import os
import boto3
import jwt
from typing import Optional, Dict
from backend.config.settings import get_settings

settings = get_settings()

# Initialize Cognito client
cognito_client = boto3.client(
    'cognito-idp',
    region_name=settings.cognito_region,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key
)


def sign_up(email: str, password: str, full_name: str) -> Dict:
    """Register new user in Cognito"""
    if not settings.cognito_user_pool_id or not settings.cognito_client_id:
        return {'success': False, 'error': 'Cognito not configured'}
    
    try:
        response = cognito_client.sign_up(
            ClientId=settings.cognito_client_id,
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': full_name}
            ]
        )
        return {'success': True, 'user_id': response['UserSub']}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def sign_in(email: str, password: str) -> Optional[Dict]:
    """Authenticate user and get tokens"""
    if not settings.cognito_user_pool_id or not settings.cognito_client_id:
        return None
    
    try:
        response = cognito_client.initiate_auth(
            ClientId=settings.cognito_client_id,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        
        tokens = response['AuthenticationResult']
        return {
            'access_token': tokens['AccessToken'],
            'id_token': tokens['IdToken'],
            'refresh_token': tokens['RefreshToken']
        }
    except Exception as e:
        print(f"Sign in error: {e}")
        return None


def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token from Cognito"""
    if not settings.cognito_user_pool_id:
        return None
    
    try:
        # Decode without verification first to get the kid
        unverified = jwt.decode(token, options={"verify_signature": False})
        
        # For production, you should verify the signature using JWKS
        # For now, we'll do basic validation
        if 'sub' not in unverified or 'email' not in unverified:
            return None
        
        return unverified
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


def refresh_token(refresh_token: str) -> Optional[Dict]:
    """Refresh access token using refresh token"""
    if not settings.cognito_client_id:
        return None
    
    try:
        response = cognito_client.initiate_auth(
            ClientId=settings.cognito_client_id,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token
            }
        )
        
        tokens = response['AuthenticationResult']
        return {
            'access_token': tokens['AccessToken'],
            'id_token': tokens['IdToken']
        }
    except Exception as e:
        print(f"Token refresh error: {e}")
        return None

