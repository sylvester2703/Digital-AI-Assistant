from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ConnectedAccountResponse(BaseModel):
    id: str
    provider: str
    provider_account_id: Optional[str] = None
    account_email: Optional[str] = None
    scopes: Optional[str] = None
    is_connected: bool
    last_synced_at: Optional[datetime] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class IntegrationStatusResponse(BaseModel):
    providers: List[ConnectedAccountResponse]


class ConnectAccountRequest(BaseModel):
    provider: str  # GOOGLE, MICROSOFT, TELEGRAM
    code: Optional[str] = None
    telegram_chat_id: Optional[str] = None


class SyncTriggerResponse(BaseModel):
    provider: str
    status: str
    synced_items_count: int
    message: str
