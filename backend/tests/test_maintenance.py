"""Tests for patient-facing maintenance state."""

import pytest
from fastapi import HTTPException, status
from fastapi.testclient import TestClient

from app.core.maintenance import (
    DEFAULT_ACTIVE_MESSAGE,
    DEFAULT_INACTIVE_MESSAGE,
    ensure_scheduling_completion_available,
    get_maintenance_state,
)
from app.main import app


def test_maintenance_state_defaults_to_available(monkeypatch) -> None:
    """Maintenance is inactive when no environment flag is set."""
    monkeypatch.delenv("CLINIC_MAINTENANCE_ACTIVE", raising=False)

    state = get_maintenance_state()

    assert state.active is False
    assert state.message == DEFAULT_INACTIVE_MESSAGE


def test_maintenance_state_endpoint_returns_active_message(
    monkeypatch,
) -> None:
    """The public endpoint exposes a safe active maintenance message."""
    monkeypatch.setenv("CLINIC_MAINTENANCE_ACTIVE", "true")

    response = TestClient(app).get("/api/maintenance-state")

    assert response.status_code == 200
    assert response.json() == {
        "active": True,
        "message": DEFAULT_ACTIVE_MESSAGE,
    }


def test_scheduling_completion_is_blocked_during_maintenance(
    monkeypatch,
) -> None:
    """Completion guard raises a 503 while maintenance is active."""
    monkeypatch.setenv("CLINIC_MAINTENANCE_ACTIVE", "on")

    with pytest.raises(HTTPException) as exc_info:
        ensure_scheduling_completion_available()

    assert exc_info.value.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert exc_info.value.detail == DEFAULT_ACTIVE_MESSAGE
