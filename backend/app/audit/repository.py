"""Persistence helpers for audit events."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from typing import Any

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.audit.models import AuditEvent


class AuditEventRepository:
    """Store and query audit events with explicit filters."""

    def __init__(self, session: Session) -> None:
        """Create a repository bound to a SQLAlchemy session."""
        self._session = session

    def record(
        self,
        *,
        action: str,
        outcome: str,
        actor_id: str | None = None,
        actor_type: str | None = None,
        actor_context: dict[str, Any] | None = None,
        resource_type: str | None = None,
        resource_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        occurred_at: datetime | None = None,
    ) -> AuditEvent:
        """Persist a single audit event and return the saved row."""
        event = AuditEvent(
            action=action,
            outcome=outcome,
            actor_id=actor_id,
            actor_type=actor_type,
            actor_context=actor_context or {},
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_=metadata or {},
        )
        if occurred_at is not None:
            event.occurred_at = occurred_at

        self._session.add(event)
        self._session.commit()
        self._session.refresh(event)
        return event

    def list_events(
        self,
        *,
        action: str | None = None,
        outcome: str | None = None,
        actor_id: str | None = None,
        resource_type: str | None = None,
        limit: int = 100,
    ) -> Sequence[AuditEvent]:
        """Return matching audit events ordered from newest to oldest."""
        statement: Select[tuple[AuditEvent]] = select(AuditEvent)

        if action is not None:
            statement = statement.where(AuditEvent.action == action)
        if outcome is not None:
            statement = statement.where(AuditEvent.outcome == outcome)
        if actor_id is not None:
            statement = statement.where(AuditEvent.actor_id == actor_id)
        if resource_type is not None:
            statement = statement.where(
                AuditEvent.resource_type == resource_type,
            )

        statement = statement.order_by(AuditEvent.occurred_at.desc()).limit(
            max(1, min(limit, 500)),
        )
        return self._session.scalars(statement).all()
