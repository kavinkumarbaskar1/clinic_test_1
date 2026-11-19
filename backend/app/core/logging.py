"""Structured logging helpers with PHI-conscious redaction."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

REDACTED_VALUE = "[REDACTED]"

SECRET_FIELD_NAMES = frozenset(
    {
        "access_token",
        "api_key",
        "authorization",
        "client_secret",
        "cookie",
        "one_time_code",
        "otp",
        "passcode",
        "password",
        "refresh_token",
        "secret",
        "session_token",
        "token",
        "verification_code",
    },
)

UNSUPPORTED_PHI_FIELD_NAMES = frozenset(
    {
        "address",
        "birth_date",
        "clinical_note",
        "date_of_birth",
        "diagnosis",
        "dob",
        "email",
        "full_name",
        "insurance_id",
        "medical_record_number",
        "mrn",
        "patient_name",
        "phone",
        "reason",
        "ssn",
        "visit_reason",
    },
)

SAFE_LOG_FIELD_NAMES = frozenset(
    {
        "action",
        "actor_role",
        "actor_type",
        "attempt_count",
        "correlation_id",
        "duration_ms",
        "endpoint",
        "error_code",
        "event_id",
        "feature",
        "http_method",
        "integration_name",
        "ip_hash",
        "outcome",
        "request_id",
        "resource_id",
        "resource_type",
        "status_code",
        "tenant_id",
        "user_agent_family",
    },
)

REDACTED_FIELD_NAMES = SECRET_FIELD_NAMES | UNSUPPORTED_PHI_FIELD_NAMES


def sanitize_log_context(
    context: Mapping[str, Any] | None,
) -> dict[str, Any]:
    """Return context containing only supported fields with redactions."""
    if not context:
        return {}

    sanitized: dict[str, Any] = {}
    for field_name, value in context.items():
        normalized_name = field_name.lower()
        if normalized_name in REDACTED_FIELD_NAMES:
            sanitized[field_name] = REDACTED_VALUE
        elif normalized_name in SAFE_LOG_FIELD_NAMES:
            sanitized[field_name] = _safe_scalar(value)
    return sanitized


def build_log_extra(context: Mapping[str, Any] | None) -> dict[str, Any]:
    """Build a structured logging payload under the ``context`` key."""
    return {"context": sanitize_log_context(context)}


def get_safe_logger(name: str) -> logging.LoggerAdapter[logging.Logger]:
    """Return a logger adapter that keeps structured context names stable."""
    logger = logging.getLogger(name)
    return logging.LoggerAdapter(logger, {"context": {}})


def log_event(
    logger: logging.Logger | logging.LoggerAdapter[logging.Logger],
    level: int,
    message: str,
    *,
    context: Mapping[str, Any] | None = None,
) -> None:
    """Log an event with sanitized structured context."""
    logger.log(level, message, extra=build_log_extra(context))


def _safe_scalar(value: Any) -> str | int | float | bool | None:
    """Return JSON-friendly scalar values and drop nested PHI containers."""
    if value is None or isinstance(value, str | int | float | bool):
        return value
    return str(value)
