"""Authentication dependencies for FastAPI routes"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from backend.models.dynamodb import User
from backend.auth.cognito import verify_token
from backend.database import get_table

security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None (for optional auth)"""
    if not credentials:
        # Return a default user for demo purposes
        return User(
            id="demo-user",
            email="demo@example.com",
            full_name="Demo User",
            role="viewer",
            tenant_id="default-tenant",
            is_active=True,
            created_at=str(int(__import__('time').time()))
        )
    
    try:
        token = credentials.credentials
        decoded_token = verify_token(token)
        
        if not decoded_token:
            return None
        
        # Extract user info from token
        user_id = decoded_token.get('sub')
        email = decoded_token.get('email')
        
        # Get user from database
        users_table = get_table('users')
        response = users_table.get_item(Key={'id': user_id})
        
        if 'Item' not in response:
            return None
        
        return User(**response['Item'])
    except Exception:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """Get current user, raise exception if not authenticated"""
    user = await get_current_user_optional(credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )
    
    return user

