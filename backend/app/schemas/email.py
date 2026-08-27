from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ExtractedFactResponse(BaseModel):
    id: str
    email_id: str
    fact_type: str
    fact_nature: str
    value: str
    confidence: float
    evidence: Optional[str] = None
    is_confirmed_by_user: bool
    converted_to_task: bool
    converted_task_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EmailMessageResponse(BaseModel):
    id: str
    user_id: str
    provider_id: str
    thread_id: Optional[str] = None
    sender_name: Optional[str] = None
    sender_email: str
    recipient_email: Optional[str] = None
    subject: str
    snippet: Optional[str] = None
    body_text: Optional[str] = None
    received_at: datetime
    category: str
    priority: str
    summary: Optional[str] = None
    is_read: bool
    is_archived: bool
    is_actionable: bool
    extracted_facts: List[ExtractedFactResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConvertFactToTaskRequest(BaseModel):
    title: Optional[str] = None
    due_at: Optional[datetime] = None
    priority: Optional[str] = "HIGH"
