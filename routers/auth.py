from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth.jwt_handler import create_access_token


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"]
)


class LoginRequest(BaseModel):
    email: str
    password: str


FAKE_ADMIN = {
    "email": "admin@whoai.dev",
    "password": "admin123",
    "role": "admin",
}


@router.post("/login")
async def login(payload: LoginRequest):

    if payload.email != FAKE_ADMIN["email"]:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if payload.password != FAKE_ADMIN["password"]:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token({
        "email": payload.email,
        "role": FAKE_ADMIN["role"],
    })

    return {
        "access_token": token,
        "token_type": "bearer",
    }