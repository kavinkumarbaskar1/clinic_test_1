"""Tests for system health routes."""

from fastapi.testclient import TestClient

from app.main import app


def test_health_check_returns_safe_service_status() -> None:
    """Health check returns API readiness without scheduling data."""
    response = TestClient(app).get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Clinic Booking API",
        "version": "0.1.0",
    }
