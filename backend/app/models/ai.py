from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid


class DailyDigest(Base, TimestampMixin):
    __tablename__ = "daily_digests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    digest_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    greeting: Mapped[str] = mapped_column(String(255), nullable=False)
    summary_text: Mapped[str] = mapped_column(Text, nullable=False)
    
    priorities_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    schedule_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    insights_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        Index("ix_user_digest_date", "user_id", "digest_date", unique=True),
    )


class WeeklyReport(Base, TimestampMixin):
    __tablename__ = "weekly_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    week_start_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    week_end_date: Mapped[str] = mapped_column(String(20), nullable=False)
    
    metrics_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    recommendations_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    learning_focus_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)

    __table_args__ = (
        Index("ix_user_week_report", "user_id", "week_start_date", unique=True),
    )


class InterviewPrep(Base, TimestampMixin):
    __tablename__ = "interview_preps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    interview_id: Mapped[str] = mapped_column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    company_overview: Mapped[str] = mapped_column(Text, nullable=False)
    role_summary: Mapped[str] = mapped_column(Text, nullable=False)
    top_skills_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    
    technical_questions_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    behavioral_questions_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    sql_questions_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    python_questions_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    questions_to_ask_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    preparation_checklist_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
