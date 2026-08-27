from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ApplicationCreate(BaseModel):
    job_id: Optional[str] = None
    company_name: str
    role_title: str
    platform: str = "DIRECT"
    status: str = "APPLIED"  # SAVED, APPLIED, ASSESSMENT, INTERVIEW, SELECTED, REJECTED, OFFER, WITHDRAWN
    applied_at: Optional[datetime] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    location: Optional[str] = None
    salary_offered: Optional[str] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    salary_offered: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None


class InterviewCreate(BaseModel):
    application_id: Optional[str] = None
    company_name: str
    role_title: str
    round_name: str = "Technical Round 1"
    round_number: int = 1
    start_at: datetime
    end_at: datetime
    interview_type: str = "TECHNICAL"
    meeting_link: Optional[str] = None
    interviewer_info: Optional[str] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    round_name: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    interview_type: Optional[str] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    prep_progress_percent: Optional[int] = None


class InterviewResponse(BaseModel):
    id: str
    user_id: str
    application_id: Optional[str] = None
    company_name: str
    role_title: str
    round_name: str
    round_number: int
    start_at: datetime
    end_at: datetime
    interview_type: str
    meeting_link: Optional[str] = None
    interviewer_info: Optional[str] = None
    status: str
    notes: Optional[str] = None
    prep_progress_percent: int
    conflicts_detected: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FollowUpResponse(BaseModel):
    id: str
    application_id: str
    company_name: str
    role_title: str
    recommended_at: datetime
    due_date: datetime
    suggested_message: str
    status: str
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FollowUpActionRequest(BaseModel):
    status: str  # COMPLETED, SNOOZED, IGNORED
    snooze_days: Optional[int] = 7


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: Optional[str] = None
    company_name: str
    role_title: str
    platform: str
    applied_at: datetime
    status: str
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    location: Optional[str] = None
    salary_offered: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    last_status_change_at: datetime
    interviews: List[InterviewResponse] = []
    follow_ups: List[FollowUpResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
