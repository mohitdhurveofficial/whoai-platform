import secrets
from hashlib import sha256


API_KEY_PREFIX = "whoai_"


def generate_api_key():
    raw_key = secrets.token_hex(32)
    return f"{API_KEY_PREFIX}{raw_key}"


def hash_api_key(api_key: str):
    return sha256(api_key.encode()).hexdigest()


def mask_api_key(api_key: str):
    if len(api_key) < 10:
        return "invalid-key"
    return f"{api_key[:8]}...{api_key[-4:]}"