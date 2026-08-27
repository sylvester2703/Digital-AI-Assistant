from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid


class CalendarEvent(Base, TimestampMixin):
    __tablename__ = "calendar_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Event Types: CLASS, ASSIGNMENT, EXAM, INTERVIEW, MEETING, PERSONAL, DEADLINE, ASSESSMENT
    event_type: Mapped[str] = mapped_column(String(50), default="PERSONAL", nullable=False, index=True)
    
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    all_day: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meeting_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Sync flags
    is_synced: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    google_event_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    source_type: Mapped[str] = mapped_column(String(50), default="MANUAL", nullable=False)
    source_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Conflict detector flag
    has_conflict: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    conflict_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="calendar_events")

    __table_args__ = (
        Index("ix_user_events_range", "user_id", "start_at", "end_at"),
    )
