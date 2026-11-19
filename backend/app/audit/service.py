"""Application service for writing safe audit events."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.audit.models import AuditEvent
from app.audit.repository import AuditEventRepository
from app.core.logging import sanitize_log_context

AUDIT_ACCESS = "access"
AUDIT_CONFIGURATION_CHANGE = "configuration_change"
AUDIT_VERIFICATION_OUTCOME = "verification_outcome"
AUDIT_INTEGRATION_FAILURE = "integration_failure"
AUDIT_ACCESS_DENIED = "access_denied"

OUTCOME_ALLOWED = "allowed"
OUTCOME_DENIED = "denied"
OUTCOME_FAILURE = "failure"
OUTCOME_SUCCESS = "success"


class AuditService:
    """Record auditable workflow activity without unnecessary PHI."""

    def __init__(self, repository: AuditEventRepository) -> None:
        """Create an audit service backed by a repository."""
        self._repository = repository

    @classmethod
    def from_session(cls, session: Session) -> AuditService:
        """Create an audit service for the provided database session."""
        return cls(AuditEventRepository(session))

    def record_event(
        self,
        *,
        action: str,
        outcome: str,
        actor_id: str | None = None,
        actor_type: str | None = None,
        actor_context: Mapping[str, Any] | None = None,
        resource_type: str | None = None,
        resource_id: str | None = None,
        metadata: Mapping[str, Any] | None = None,
        occurred_at: datetime | None = None,
    ) -> AuditEvent:
        """Record an audit event after sanitizing context and metadata."""
        return self._repository.record(
            action=action,
            outcome=outcome,
            actor_id=actor_id,
            actor_type=actor_type,
            actor_context=sanitize_log_context(actor_context),
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=sanitize_log_context(metadata),
            occurred_at=occurred_at,
        )

    def record_access(
        self,
        *,
        actor_id: str | None,
        actor_type: str | None,
        resource_type: str,
        resource_id: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> AuditEvent:
        """Record a permitted resource access event."""
        return self.record_event(
            action=AUDIT_ACCESS,
            outcome=OUTCOME_ALLOWED,
            actor_id=actor_id,
            actor_type=actor_type,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata,
        )

    def record_configuration_change(
        self,
        *,
        actor_id: str | None,
        actor_type: str | None,
        resource_type: str,
        resource_id: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> AuditEvent:
        """Record a successful configuration change."""
        return self.record_event(
            action=AUDIT_CONFIGURATION_CHANGE,
            outcome=OUTCOME_SUCCESS,
            actor_id=actor_id,
            actor_type=actor_type,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata,
        )

    def record_verification_outcome(
        self,
        *,
        actor_id: str | None,
        actor_type: str | None,
        outcome: str,
        resource_id: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> AuditEvent:
        """Record a verification result without raw one-time code values."""
        return self.record_event(
            action=AUDIT_VERIFICATION_OUTCOME,
            outcome=outcome,
            actor_id=actor_id,
            actor_type=actor_type,
            resource_type="verification",
            resource_id=resource_id,
            metadata=metadata,
        )

    def record_integration_failure(
        self,
        *,
        integration_name: str,
        actor_id: str | None = None,
        actor_type: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> AuditEvent:
        """Record a third-party integration failure."""
        safe_metadata = {
            "integration_name": integration_name,
            **dict(metadata or {}),
        }
        return self.record_event(
            action=AUDIT_INTEGRATION_FAILURE,
            outcome=OUTCOME_FAILURE,
            actor_id=actor_id,
            actor_type=actor_type,
            resource_type="integration",
            resource_id=integration_name,
            metadata=safe_metadata,
        )

    def record_denied_access(
        self,
        *,
        actor_id: str | None,
        actor_type: str | None,
        resource_type: str,
        resource_id: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> AuditEvent:
        """Record a denied authorization or authentication attempt."""
        return self.record_event(
            action=AUDIT_ACCESS_DENIED,
            outcome=OUTCOME_DENIED,
            actor_id=actor_id,
            actor_type=actor_type,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata,
        )

    def list_events(
        self,
        *,
        action: str | None = None,
        outcome: str | None = None,
        actor_id: str | None = None,
        resource_type: str | None = None,
        limit: int = 100,
    ) -> Sequence[AuditEvent]:
        """Return matching events through the repository."""
        return self._repository.list_events(
            action=action,
            outcome=outcome,
            actor_id=actor_id,
            resource_type=resource_type,
            limit=limit,
        )
