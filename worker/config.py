from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    S3_API_URL: str
    S3_ACCESS_KEY_ID: str
    S3_SECRET_ACCESS_KEY: str
    S3_BUCKET_NAME: str
    REDIS_URL: str

    class Config:
        env_file = ".env"

settings = Settings()