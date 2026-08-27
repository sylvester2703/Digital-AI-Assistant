import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="STUDENT", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)

    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    connected_accounts: Mapped[List["ConnectedAccount"]] = relationship("ConnectedAccount", back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    calendar_events: Mapped[List["CalendarEvent"]] = relationship("CalendarEvent", back_populates="user", cascade="all, delete-orphan")
    courses: Mapped[List["Course"]] = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    emails: Mapped[List["EmailMessage"]] = relationship("EmailMessage", back_populates="user", cascade="all, delete-orphan")
    user_skills: Mapped[List["UserSkill"]] = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[List["JobApplication"]] = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    interviews: Mapped[List["Interview"]] = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    resumes: Mapped[List["Resume"]] = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    notification_pref: Mapped[Optional["NotificationPreference"]] = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    headline: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    education: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    degree: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    branch: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    grad_year: Mapped[Optional[int]] = mapped_column(nullable=True)
    
    target_roles: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string list
    target_locations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string list
    remote_pref: Mapped[str] = mapped_column(String(50), default="ANY", nullable=False)  # REMOTE, HYBRID, ONSITE, ANY
    employment_pref: Mapped[str] = mapped_column(String(50), default="INTERNSHIP_OR_FULLTIME", nullable=False)
    
    expected_salary: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    expected_stipend: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    certifications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string list

    user: Mapped["User"] = relationship("User", back_populates="profile")


class ConnectedAccount(Base, TimestampMixin):
    __tablename__ = "connected_accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # GOOGLE, GMAIL, GOOGLE_CALENDAR, GOOGLE_CLASSROOM, MICROSOFT, TELEGRAM
    provider_account_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    account_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    scopes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    is_connected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="connected_accounts")
    oauth_credential: Mapped[Optional["OAuthCredential"]] = relationship("OAuthCredential", back_populates="connected_account", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_user_provider", "user_id", "provider", unique=True),
    )


class OAuthCredential(Base, TimestampMixin):
    __tablename__ = "oauth_credentials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    connected_account_id: Mapped[str] = mapped_column(String(36), ForeignKey("connected_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)

    encrypted_access_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    encrypted_refresh_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    token_type: Mapped[Optional[str]] = mapped_column(String(50), default="Bearer")

    connected_account: Mapped["ConnectedAccount"] = relationship("ConnectedAccount", back_populates="oauth_credential")


class SyncState(Base, TimestampMixin):
    __tablename__ = "sync_states"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # GMAIL, CALENDAR, CLASSROOM
    sync_cursor: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="IDLE", nullable=False)  # IDLE, SYNCING, FAILED, COMPLETED
    last_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_sync_user_entity", "user_id", "entity_type", unique=True),
    )
