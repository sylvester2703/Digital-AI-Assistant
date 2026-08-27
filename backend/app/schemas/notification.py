from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    category: str
    channel: str
    is_read: bool
    link_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationPrefUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    telegram_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    critical_instant: Optional[bool] = None
    important_digest: Optional[bool] = None
    digest_frequency: Optional[str] = None


class NotificationPrefResponse(BaseModel):
    email_enabled: bool
    telegram_enabled: bool
    push_enabled: bool
    critical_instant: bool
    important_digest: bool
    digest_frequency: str

    model_config = ConfigDict(from_attributes=True)
