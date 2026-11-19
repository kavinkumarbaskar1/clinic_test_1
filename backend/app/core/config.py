"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings for the clinic booking backend."""

    app_name: str = "Clinic Booking API"
    app_version: str = "0.1.0"
    database_url: str = "sqlite:///./clinic_booking.db"
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
    )
    docs_enabled: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="CLINIC_",
        extra="ignore",
    )

    @property
    def docs_url(self) -> str | None:
        """Return the Swagger UI path when documentation is enabled."""
        if self.docs_enabled:
            return "/docs"
        return None

    @property
    def redoc_url(self) -> str | None:
        """Return the ReDoc path when documentation is enabled."""
        if self.docs_enabled:
            return "/redoc"
        return None

    @property
    def openapi_url(self) -> str | None:
        """Return the OpenAPI path when documentation is enabled."""
        if self.docs_enabled:
            return "/openapi.json"
        return None


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()
