from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid, utc_now


class JobApplication(Base, TimestampMixin):
    __tablename__ = "job_applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True, index=True)

    company_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    role_title: Mapped[str] = mapped_column(String(200), nullable=False)
    platform: Mapped[str] = mapped_column(String(100), default="DIRECT", nullable=False)
    
    applied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    
    # Status: SAVED, APPLIED, ASSESSMENT, INTERVIEW, SELECTED, REJECTED, OFFER, WITHDRAWN
    status: Mapped[str] = mapped_column(String(50), default="APPLIED", nullable=False, index=True)
    
    recruiter_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    recruiter_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    salary_offered: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resume_version_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    follow_up_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_status_change_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="applications")
    interviews: Mapped[List["Interview"]] = relationship("Interview", back_populates="application", cascade="all, delete-orphan")
    follow_ups: Mapped[List["FollowUp"]] = relationship("FollowUp", back_populates="application", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_user_app_status", "user_id", "status"),
    )


class Interview(Base, TimestampMixin):
    __tablename__ = "interviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("job_applications.id", ondelete="CASCADE"), nullable=True, index=True)

    company_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role_title: Mapped[str] = mapped_column(String(200), nullable=False)
    round_name: Mapped[str] = mapped_column(String(100), default="Technical Round 1", nullable=False)
    round_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    
    # Types: TECHNICAL, BEHAVIORAL, HR, SYSTEM_DESIGN, LIVE_CODING, SCREENING
    interview_type: Mapped[str] = mapped_column(String(50), default="TECHNICAL", nullable=False)
    
    meeting_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    interviewer_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Status: SCHEDULED, RESCHEDULED, COMPLETED, CANCELLED
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED", nullable=False, index=True)
    
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prep_progress_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    conflicts_detected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="interviews")
    application: Mapped[Optional["JobApplication"]] = relationship("JobApplication", back_populates="interviews")


class FollowUp(Base, TimestampMixin):
    __tablename__ = "follow_ups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("job_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    recommended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    suggested_message: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Status: PENDING, COMPLETED, SNOOZED, IGNORED
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False, index=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    application: Mapped["JobApplication"] = relationship("JobApplication", back_populates="follow_ups")
