from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = "MEDIUM"  # CRITICAL, HIGH, MEDIUM, LOW
    status: str = "TODO"  # TODO, IN_PROGRESS, COMPLETED, CANCELLED
    due_at: Optional[datetime] = None
    estimated_duration_minutes: Optional[int] = 30
    source_type: str = "MANUAL"
    source_id: Optional[str] = None
    tags: Optional[List[str]] = []


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_at: Optional[datetime] = None
    estimated_duration_minutes: Optional[int] = None
    tags: Optional[List[str]] = None


class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    priority: str
    calculated_score: float
    status: str
    due_at: Optional[datetime] = None
    estimated_duration_minutes: Optional[int] = None
    completed_at: Optional[datetime] = None
    source_type: str
    source_id: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
