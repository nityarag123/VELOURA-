import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = VELOURA Luxury Bakery
    API_V1_STR: str = /api
    SECRET_KEY: str = os.getenv(SECRET_KEY, veloura_super_secret_jwt_key_2026_bakery_luxury)
    ALGORITHM: str = HS256
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv(DATABASE_URL, sqlite:///./veloura.db)
    CORS_ORIGINS: list[str] = [http://localhost:5173, http://127.0.0.1:5173, http://localhost:3000]

    class Config:
        case_sensitive = True

settings = Settings()
