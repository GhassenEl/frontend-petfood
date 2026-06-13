"""Validation JWT optionnelle pour le service FastAPI ML."""

import os
from typing import Any, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer(auto_error=False)

VALID_ROLES = {"admin", "client", "livreur", "vet", "vendor"}


def _decode_options() -> dict[str, Any]:
    options: dict[str, Any] = {"algorithms": ["HS256"]}
    issuer = os.getenv("JWT_ISSUER")
    audience = os.getenv("JWT_AUDIENCE")
    if issuer:
        options["issuer"] = issuer
    if audience:
        options["audience"] = audience
    return options


def verify_jwt(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict[str, Any]:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        return {}

    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token manquant",
        )

    try:
        payload = jwt.decode(credentials.credentials, secret, **_decode_options())
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré",
        ) from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
        ) from exc

    role = payload.get("role")
    if role and role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rôle invalide",
        )

    return payload


def require_jwt(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict[str, Any]:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        return {}
    return verify_jwt(credentials)
