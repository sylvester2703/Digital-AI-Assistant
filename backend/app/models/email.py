from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid


class EmailMessage(Base, TimestampMixin):
    __tablename__ = "email_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    provider_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    thread_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    
    sender_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    sender_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    recipient_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    body_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    # Categories: INTERVIEW, JOB_OPPORTUNITY, INTERNSHIP, COLLEGE, ASSIGNMENT, EXAM, MEETING, IMPORTANT, PROMOTIONAL, GENERAL, ASSESSMENT, APPLICATION_UPDATE, OFFER, REJECTION, ONBOARDING
    category: Mapped[str] = mapped_column(String(50), default="GENERAL", nullable=False, index=True)
    
    # Priority: CRITICAL, HIGH, MEDIUM, LOW
    priority: Mapped[str] = mapped_column(String(50), default="LOW", nullable=False, index=True)
    
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_actionable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="emails")
    extracted_facts: Mapped[List["ExtractedFact"]] = relationship("ExtractedFact", back_populates="email", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_user_provider_msg", "user_id", "provider_id", unique=True),
        Index("ix_user_email_category_received", "user_id", "category", "received_at"),
    )


class ExtractedFact(Base, TimestampMixin):
    __tablename__ = "extracted_facts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email_id: Mapped[str] = mapped_column(String(36), ForeignKey("email_messages.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Fact Types: INTERVIEW_DATE, MEETING_URL, DEADLINE, COMPANY, ROLE, SALARY, ACTION_REQUIRED, ASSESSMENT_WINDOW
    fact_type: Mapped[str] = mapped_column(String(50), nullable=False)
    fact_nature: Mapped[str] = mapped_column(String(50), default="FACT", nullable=False)  # FACT, INFERENCE, RECOMMENDATION
    
    value: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.9, nullable=False)  # 0.0 to 1.0
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    is_confirmed_by_user: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    converted_to_task: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    converted_task_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    email: Mapped["EmailMessage"] = relationship("EmailMessage", back_populates="extracted_facts")
