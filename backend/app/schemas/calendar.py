from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CalendarEventBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: str = "PERSONAL"  # CLASS, ASSIGNMENT, EXAM, INTERVIEW, MEETING, PERSONAL, DEADLINE, ASSESSMENT
    start_at: datetime
    end_at: datetime
    all_day: bool = False
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    source_type: str = "MANUAL"
    source_id: Optional[str] = None


class CalendarEventCreate(CalendarEventBase):
    pass


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    all_day: Optional[bool] = None
    location: Optional[str] = None
    meeting_url: Optional[str] = None


class CalendarEventResponse(CalendarEventBase):
    id: str
    user_id: str
    is_synced: bool
    google_event_id: Optional[str] = None
    has_conflict: bool
    conflict_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConflictAlert(BaseModel):
    event_a_id: str
    event_a_title: str
    event_b_id: str
    event_b_title: str
    overlap_start: datetime
    overlap_end: datetime
    recommendation: str
