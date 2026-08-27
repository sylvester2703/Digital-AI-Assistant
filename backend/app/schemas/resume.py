from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ResumeVersionResponse(BaseModel):
    id: str
    version_number: int
    file_path: str
    changelog: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    target_role: Optional[str] = None
    is_default: bool
    file_name: str
    file_size_bytes: int
    extracted_text: Optional[str] = None
    versions: List[ResumeVersionResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeMatchResponse(BaseModel):
    resume_id: str
    job_id: str
    profile_match_score: float
    resume_match_score: float
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    suggestions: List[str] = []
