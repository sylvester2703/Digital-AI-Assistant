from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid, utc_now


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    company_name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    location: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    work_mode: Mapped[str] = mapped_column(String(50), default="REMOTE", nullable=False)  # REMOTE, HYBRID, ONSITE
    employment_type: Mapped[str] = mapped_column(String(50), default="FULL_TIME", nullable=False)  # FULL_TIME, INTERNSHIP, CONTRACT
    experience_level: Mapped[str] = mapped_column(String(50), default="ENTRY_LEVEL", nullable=False)  # ENTRY_LEVEL, MID_LEVEL, SENIOR
    
    min_salary: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_salary: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    
    canonical_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    source_name: Mapped[str] = mapped_column(String(100), default="DIRECT", nullable=False)  # DIRECT, RSS, JOB_ALERT, MANUAL
    external_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    deadline_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    skills: Mapped[List["JobSkill"]] = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    matches: Mapped[List["JobMatch"]] = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_job_title_company", "title", "company_name"),
    )


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="TECHNICAL", nullable=False)  # TECHNICAL, SOFT, TOOL, FRAMEWORK


class UserSkill(Base, TimestampMixin):
    __tablename__ = "user_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    proficiency: Mapped[str] = mapped_column(String(50), default="INTERMEDIATE", nullable=False)  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    years_experience: Mapped[Optional[float]] = mapped_column(Float, default=1.0, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="user_skills")

    __table_args__ = (
        Index("ix_user_skill_unique", "user_id", "skill_name", unique=True),
    )


class JobSkill(Base, TimestampMixin):
    __tablename__ = "job_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    job: Mapped["Job"] = relationship("Job", back_populates="skills")


class JobMatch(Base, TimestampMixin):
    __tablename__ = "job_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)

    total_score: Mapped[float] = mapped_column(Float, nullable=False, index=True)  # 0 - 100 deterministic
    skill_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    role_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    location_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    experience_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    salary_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    freshness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    matched_skills: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON list
    missing_skills: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON list
    explanation_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)  # JSON object
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    job: Mapped["Job"] = relationship("Job", back_populates="matches")

    __table_args__ = (
        Index("ix_user_job_match", "user_id", "job_id", unique=True),
        Index("ix_user_job_score", "user_id", "total_score"),
    )
