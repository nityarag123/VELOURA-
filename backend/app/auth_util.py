import hashlib
import hmac
import base64
import json
import time

SECRET_KEY = "veloura_luxury_bakery_secret_key_2026_art_of_sweetness"

def hash_password(password: str) -> str:
    salt = "veloura_salt_2026"
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return pwd_hash.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_jwt_token(user_id: int, is_admin: bool = False, expires_in_seconds: int = 7 * 24 * 3600) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "is_admin": is_admin,
        "exp": int(time.time()) + expires_in_seconds
    }
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode('utf-8')).decode('utf-8').rstrip('=')
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode('utf-8')).decode('utf-8').rstrip('=')
    signature_base = f"{header_b64}.{payload_b64}"
    sig = hmac.new(SECRET_KEY.encode('utf-8'), signature_base.encode('utf-8'), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode('utf-8').rstrip('=')
    return f"{signature_base}.{sig_b64}"

def decode_jwt_token(token: str):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signature_base = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signature_base.encode('utf-8'), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode('utf-8').rstrip('=')
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
        # Add padding back if necessary
        padded_payload = payload_b64 + '=' * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded_payload).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None
