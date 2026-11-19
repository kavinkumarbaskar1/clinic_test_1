"""Database models for HIPAA-conscious audit events."""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models import Base


class AuditEvent(Base):
    """Immutable record of security- and workflow-relevant activity."""

    __tablename__ = "audit_event"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        index=True,
    )
    action: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    outcome: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        index=True,
    )
    actor_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    actor_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    actor_context: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )
    resource_type: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
    )
    resource_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column(
        "metadata",
        JSON,
        default=dict,
        nullable=False,
    )
