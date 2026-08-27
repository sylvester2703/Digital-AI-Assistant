from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CourseBase(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=150)
    instructor: Optional[str] = None
    term: Optional[str] = None
    color: str = "#3b82f6"


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: str
    user_id: str
    classroom_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssignmentBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    due_at: datetime
    max_points: Optional[float] = None
    priority: str = "MEDIUM"


class AssignmentCreate(AssignmentBase):
    course_id: str


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    max_points: Optional[float] = None
    submission_status: Optional[str] = None
    priority: Optional[str] = None


class AssignmentResponse(AssignmentBase):
    id: str
    course_id: str
    user_id: str
    submission_status: str
    classroom_assignment_id: Optional[str] = None
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnnouncementResponse(BaseModel):
    id: str
    course_id: str
    title: str
    content: str
    posted_at: datetime
    author_name: Optional[str] = None
    course_code: Optional[str] = None
    course_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
