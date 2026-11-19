"""Maintenance-state helpers for patient-facing scheduling actions."""

from os import getenv

from fastapi import HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

DEFAULT_ACTIVE_MESSAGE = (
    "Online scheduling is temporarily unavailable for scheduled maintenance. "
    "Please check back soon or contact the clinic for urgent scheduling needs."
)
DEFAULT_INACTIVE_MESSAGE = "Online scheduling is available."
TRUTHY_VALUES = {"1", "true", "yes", "on"}


class MaintenanceState(BaseModel):
    """Public maintenance state returned to frontend scheduling clients."""

    active: bool = Field(
        description="Whether patient-facing completion actions are blocked.",
    )
    message: str = Field(
        description="Safe patient-facing status message.",
    )

    model_config = ConfigDict(extra="forbid")


def _is_maintenance_active() -> bool:
    """Return whether scheduled maintenance is currently active."""
    return getenv("CLINIC_MAINTENANCE_ACTIVE", "").lower() in TRUTHY_VALUES


def get_maintenance_state() -> MaintenanceState:
    """Return the current safe maintenance state."""
    if not _is_maintenance_active():
        return MaintenanceState(
            active=False,
            message=DEFAULT_INACTIVE_MESSAGE,
        )

    return MaintenanceState(
        active=True,
        message=DEFAULT_ACTIVE_MESSAGE,
    )


def ensure_scheduling_completion_available() -> MaintenanceState:
    """Block patient completion actions while maintenance is active."""
    maintenance_state = get_maintenance_state()

    if maintenance_state.active:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=maintenance_state.message,
        )

    return maintenance_state
