from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SkillResponse(BaseModel):
    id: str
    name: str
    category: str

    model_config = ConfigDict(from_attributes=True)


class JobSkillResponse(BaseModel):
    id: str
    skill_name: str
    is_required: bool

    model_config = ConfigDict(from_attributes=True)


class JobResponse(BaseModel):
    id: str
    company_name: str
    title: str
    description: str
    location: str
    work_mode: str
    employment_type: str
    experience_level: str
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    salary_currency: str
    canonical_url: Optional[str] = None
    source_name: str
    posted_at: datetime
    deadline_at: Optional[datetime] = None
    skills: List[JobSkillResponse] = []
    
    # Calculated Match Attributes
    match_score: Optional[float] = None
    skill_score: Optional[float] = None
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    match_rationale: Optional[str] = None
    is_saved: bool = False
    is_applied: bool = False

    model_config = ConfigDict(from_attributes=True)


class JobCreate(BaseModel):
    company_name: str
    title: str
    description: str
    location: str
    work_mode: str = "REMOTE"
    employment_type: str = "FULL_TIME"
    experience_level: str = "ENTRY_LEVEL"
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    salary_currency: str = "INR"
    canonical_url: Optional[str] = None
    skills: List[str] = []


class JobFilterParams(BaseModel):
    query: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    min_match_score: Optional[float] = None
