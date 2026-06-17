import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # AI API Keys
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    
    # Internal Security (Shared with Django)
    INTERNAL_AUTH_SECRET: str
    
    # App Settings
    PROJECT_NAME: str = "Cooked AI Service"
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        extra="ignore"
    )

settings = Settings()
