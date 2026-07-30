"""Supabase JWT auth + simple per-user rate limiting."""

from __future__ import annotations

import time
import uuid
from collections import defaultdict, deque
from typing import Deque, Dict, Optional

from fastapi import Depends, Header, HTTPException, Request, status
from jose import JWTError, jwt

from src.config import Settings, get_settings


class RateLimiter:
    def __init__(self) -> None:
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)

    def check(self, key: str, limit: int, window_seconds: int = 60) -> None:
        now = time.monotonic()
        bucket = self._hits[key]
        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()
        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "code": "rate_limited",
                    "message": f"Rate limit exceeded ({limit}/min). Try again shortly.",
                },
            )
        bucket.append(now)


_rate_limiter = RateLimiter()


def get_request_id(request: Request) -> str:
    existing = request.headers.get("x-request-id")
    if existing:
        return existing
    return str(uuid.uuid4())


async def require_user(
    request: Request,
    authorization: Optional[str] = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> dict:
    """Verify Bearer JWT (Supabase) unless AUTH_DISABLED=true."""
    request_id = get_request_id(request)
    request.state.request_id = request_id

    if settings.auth_disabled:
        user = {"sub": "dev-bypass", "role": "anon"}
        request.state.user_id = user["sub"]
        _rate_limiter.check(user["sub"], settings.rate_limit_per_minute)
        return user

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "missing_token", "message": "Authorization Bearer token required."},
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1].strip()
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "auth_misconfigured",
                "message": "SUPABASE_JWT_SECRET is not configured on the backend.",
            },
        )

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_aud": True},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "invalid_token", "message": f"Invalid or expired token: {exc}"},
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "invalid_token", "message": "Token missing subject."},
        )

    request.state.user_id = user_id
    _rate_limiter.check(str(user_id), settings.rate_limit_per_minute)
    return payload
