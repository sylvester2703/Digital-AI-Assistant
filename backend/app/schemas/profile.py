from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class UserSkillBase(BaseModel):
    skill_name: str
    proficiency: str = "INTERMEDIATE"  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    years_experience: Optional[float] = 1.0


class UserSkillCreate(UserSkillBase):
    pass


class UserSkillResponse(UserSkillBase):
    id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdateRequest(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    grad_year: Optional[int] = None
    target_roles: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None
    remote_pref: Optional[str] = "ANY"
    employment_pref: Optional[str] = "INTERNSHIP_OR_FULLTIME"
    expected_salary: Optional[str] = None
    expected_stipend: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    certifications: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    grad_year: Optional[int] = None
    target_roles: List[str] = []
    target_locations: List[str] = []
    remote_pref: str = "ANY"
    employment_pref: str = "INTERNSHIP_OR_FULLTIME"
    expected_salary: Optional[str] = None
    expected_stipend: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    certifications: List[str] = []
    skills: List[UserSkillResponse] = []

    model_config = ConfigDict(from_attributes=True)
