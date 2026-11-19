"""FastAPI application entry point for the clinic booking API."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import register_exception_handlers

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    openapi_url=settings.openapi_url,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

register_exception_handlers(app)


@app.get(
    "/api/health",
    tags=["system"],
    summary="Check API health",
    description="Returns service status without reading scheduling records.",
)
async def health_check() -> dict[str, str]:
    """Return a scheduling-data-free service health response."""
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
    }
