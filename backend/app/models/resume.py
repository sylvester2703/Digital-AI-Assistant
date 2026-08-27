from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid


class Resume(Base, TimestampMixin):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(150), nullable=False)
    target_role: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="resumes")
    versions: Mapped[List["ResumeVersion"]] = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")


class ResumeVersion(Base, TimestampMixin):
    __tablename__ = "resume_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    resume_id: Mapped[str] = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)

    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    changelog: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    resume: Mapped["Resume"] = relationship("Resume", back_populates="versions")


class ResumeMatch(Base, TimestampMixin):
    __tablename__ = "resume_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    resume_id: Mapped[str] = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)

    profile_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    resume_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    
    matched_keywords: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON list
    missing_keywords: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON list
    suggestions_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON list

    __table_args__ = (
        Index("ix_resume_job_match", "resume_id", "job_id", unique=True),
    )
