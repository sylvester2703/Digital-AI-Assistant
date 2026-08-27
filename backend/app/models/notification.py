from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, generate_uuid


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Category: CRITICAL, IMPORTANT, DIGEST
    category: Mapped[str] = mapped_column(String(50), default="IMPORTANT", nullable=False, index=True)
    
    # Channel: IN_APP, EMAIL, TELEGRAM, PUSH
    channel: Mapped[str] = mapped_column(String(50), default="IN_APP", nullable=False)
    
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    link_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    scheduled_for: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    dedupe_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)

    user: Mapped["User"] = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("ix_user_notif_unread", "user_id", "is_read", "created_at"),
    )


class NotificationPreference(Base, TimestampMixin):
    __tablename__ = "notification_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    email_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    telegram_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    push_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    critical_instant: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    important_digest: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    digest_frequency: Mapped[str] = mapped_column(String(50), default="DAILY", nullable=False)  # DAILY, WEEKLY, OFF

    user: Mapped["User"] = relationship("User", back_populates="notification_pref")
