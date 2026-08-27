from typing import Optional
from fastapi import Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    token: Optional[str] = None
    
    # 1. Check Authorization Bearer header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    # 2. Check Cookie
    if not token and "access_token" in request.cookies:
        token = request.cookies["access_token"]
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

    if not token:
        raise UnauthorizedException(message="Authentication required. Please log in.")

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedException(message="Invalid or expired authentication session.")

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException(message="User account not found.")

    if not user.is_active:
        raise UnauthorizedException(message="User account is deactivated.")

    return user
