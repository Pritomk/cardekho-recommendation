from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CarDekho AI Advisor"
    database_url: str = "sqlite:///./cardekho_ai.db"
    frontend_origin: str = "http://localhost:3000"

    llm_provider: str = "mock"
    llm_model: str = "advisor-default"
    openai_api_key: str | None = None
    gemini_api_key: str | None = None
    anthropic_api_key: str | None = None
    nvidia_api_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

