from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException
import hashlib
from pydantic import BaseModel, EmailStr

from app.auth.jwt_handler import (
    JWT_ALGORITHM,
    JWT_SECRET,
    create_access_token,
    verify_access_token,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"]
)




def hash_password(password: str):
    return hashlib.sha256(
        password.encode()
    ).hexdigest()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "reviewer"


class RefreshRequest(BaseModel):
    refresh_token: str


FAKE_USERS_DB = {
    "admin@whoai.dev": {
        "email": "admin@whoai.dev",
        "hashed_password": hash_password("admin123"),
        "role": "admin",
    }
}


REFRESH_SECRET = "whoai-refresh-secret"
REFRESH_EXPIRE_DAYS = 7


@router.post("/register")
async def register(payload: RegisterRequest):

    if payload.email in FAKE_USERS_DB:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    FAKE_USERS_DB[payload.email] = {
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "role": payload.role,
    }

    return {
        "message": "User registered successfully"
    }


@router.post("/login")
async def login(payload: LoginRequest):

    user = FAKE_USERS_DB.get(payload.email)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    valid_password = (
        hash_password(payload.password)
        == user["hashed_password"]
    )

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token({
        "email": user["email"],
        "role": user["role"],
    })

    refresh_payload = {
        "email": user["email"],
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)
    }

    refresh_token = jwt.encode(
        refresh_payload,
        REFRESH_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user["role"],
    }


@router.post("/refresh")
async def refresh_token(payload: RefreshRequest):

    try:

        decoded = jwt.decode(
            payload.refresh_token,
            REFRESH_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        access_token = create_access_token({
            "email": decoded["email"],
            "role": "reviewer",
        })

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )


@router.get("/me")
async def get_current_user(token: str):

    payload = verify_access_token(token)

    return {
        "user": payload
    }