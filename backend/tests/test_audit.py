"""Tests for audit persistence and redaction behavior."""

from collections.abc import Iterator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.audit.service import (
    AUDIT_ACCESS,
    OUTCOME_ALLOWED,
    AuditService,
)
from app.core.logging import REDACTED_VALUE
from app.db.models import Base


@pytest.fixture
def db_session(tmp_path) -> Iterator[Session]:
    """Create an isolated SQLite session for audit tests."""
    database_path = tmp_path / "audit-test.db"
    engine = create_engine(f"sqlite:///{database_path}", future=True)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        class_=Session,
        future=True,
    )
    session = session_factory()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_audit_service_persists_and_lists_events(
    db_session: Session,
) -> None:
    """Audit events are committed and returned through filtered listing."""
    service = AuditService.from_session(db_session)

    saved_event = service.record_access(
        actor_id="staff-123",
        actor_type="staff",
        resource_type="appointment",
        resource_id="appointment-456",
        metadata={"request_id": "request-789"},
    )
    matching_events = service.list_events(
        action=AUDIT_ACCESS,
        actor_id="staff-123",
        resource_type="appointment",
    )

    assert saved_event.id is not None
    assert len(matching_events) == 1
    assert matching_events[0].id == saved_event.id
    assert matching_events[0].outcome == OUTCOME_ALLOWED
    assert matching_events[0].metadata_ == {"request_id": "request-789"}


def test_audit_service_redacts_phi_and_secret_metadata(
    db_session: Session,
) -> None:
    """Audit metadata keeps safe fields and redacts PHI or secrets."""
    service = AuditService.from_session(db_session)

    event = service.record_verification_outcome(
        actor_id="staff-123",
        actor_type="staff",
        outcome=OUTCOME_ALLOWED,
        resource_id="verification-456",
        metadata={
            "request_id": "request-789",
            "phone": "(555) 010-0180",
            "one_time_code": "123456",
            "debug_payload": {"raw": "not allowed"},
        },
    )

    assert event.metadata_ == {
        "request_id": "request-789",
        "phone": REDACTED_VALUE,
        "one_time_code": REDACTED_VALUE,
    }
