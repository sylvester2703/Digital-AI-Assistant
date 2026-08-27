from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.academic import Announcement, Assignment, Course
from app.models.user import User
from app.schemas.academic import (
    AnnouncementResponse,
    AssignmentCreate,
    AssignmentResponse,
    AssignmentUpdate,
    CourseCreate,
    CourseResponse,
)

router = APIRouter(prefix="/courses", tags=["Academics"])


@router.get("", response_model=List[CourseResponse])
def list_courses(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.user_id == user.id, Course.is_active == True).all()
    return courses


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    req: CourseCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = Course(
        user_id=user.id,
        code=req.code,
        title=req.title,
        instructor=req.instructor,
        term=req.term,
        color=req.color,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/announcements", response_model=List[AnnouncementResponse])
def list_announcements(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    announcements = db.query(Announcement, Course).join(Course, Announcement.course_id == Course.id)\
        .filter(Announcement.user_id == user.id)\
        .order_by(Announcement.posted_at.desc()).all()

    results = []
    for a, c in announcements:
        results.append(AnnouncementResponse(
            id=a.id,
            course_id=a.course_id,
            title=a.title,
            content=a.content,
            posted_at=a.posted_at,
            author_name=a.author_name,
            course_code=c.code,
            course_title=c.title,
        ))
    return results
