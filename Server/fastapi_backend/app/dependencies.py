from fastapi import Header, HTTPException, status
from .config import settings

async def verify_internal_request(x_internal_secret: str = Header(..., alias="X-Internal-Secret")):
    """
    Dependency to verify that the request is coming from our trusted Django server.
    Checks the 'X-Internal-Secret' header against the shared secret.
    """
    if x_internal_secret != settings.INTERNAL_AUTH_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal authentication secret."
        )
    return True
