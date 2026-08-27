from datetime import datetime
from typing import List, Optional
from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Priority: CRITICAL, HIGH, MEDIUM, LOW
    priority: Mapped[str] = mapped_column(String(50), default="MEDIUM", nullable=False, index=True)
    calculated_score: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)  # Deterministic score 0-100
    
    # Status: TODO, IN_PROGRESS, COMPLETED, CANCELLED
    status: Mapped[str] = mapped_column(String(50), default="TODO", nullable=False, index=True)
    
    due_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, default=30, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Source: MANUAL, EMAIL, CLASSROOM, ASSIGNMENT, INTERVIEW, AI_SUGGESTION
    source_type: Mapped[str] = mapped_column(String(50), default="MANUAL", nullable=False)
    source_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string list

    user: Mapped["User"] = relationship("User", back_populates="tasks")
    links: Mapped[List["TaskLink"]] = relationship("TaskLink", back_populates="task", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_user_task_status_due", "user_id", "status", "due_at"),
    )


class TaskLink(Base, TimestampMixin):
    __tablename__ = "task_links"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    
    linked_entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # EMAIL, ASSIGNMENT, INTERVIEW, JOB
    linked_entity_id: Mapped[str] = mapped_column(String(100), nullable=False)

    task: Mapped["Task"] = relationship("Task", back_populates="links")
