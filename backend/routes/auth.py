"""Authentication routes"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from backend.auth.cognito import sign_up, sign_in, refresh_token, verify_token
from backend.auth.dependencies import get_current_user
from backend.models.dynamodb import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/signup")
async def register_user(request: SignUpRequest):
    """Register new user"""
    result = sign_up(request.email, request.password, request.full_name)
    
    if not result.get('success'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'Registration failed')
        )
    
    return {"message": "User registered successfully", "user_id": result['user_id']}


@router.post("/signin")
async def login_user(request: SignInRequest):
    """Authenticate user and get tokens"""
    tokens = sign_in(request.email, request.password)
    
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    return tokens


@router.post("/refresh")
async def refresh_access_token(request: RefreshTokenRequest):
    """Refresh access token"""
    tokens = refresh_token(request.refresh_token)
    
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    return tokens


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user

