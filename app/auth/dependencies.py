from fastapi import Header, HTTPException

API_KEYS = []


async def verify_api_key(
    x_api_key: str = Header(None)
):

    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="API key missing"
        )

    if x_api_key not in API_KEYS:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )

    return x_api_key