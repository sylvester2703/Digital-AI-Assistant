from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.academic import Assignment, Course
from app.models.application import Interview, JobApplication
from app.models.calendar_event import CalendarEvent
from app.models.career import Job
from app.models.email import EmailMessage
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/search", tags=["Global Search"])


@router.get("")
def global_search(
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, List[Dict[str, Any]]]:
    term = f"%{q}%"

    # Tasks
    tasks = db.query(Task).filter(
        Task.user_id == user.id,
        Task.title.ilike(term) | Task.description.ilike(term),
    ).limit(5).all()

    # Calendar
    events = db.query(CalendarEvent).filter(
        CalendarEvent.user_id == user.id,
        CalendarEvent.title.ilike(term) | CalendarEvent.description.ilike(term),
    ).limit(5).all()

    # Emails
    emails = db.query(EmailMessage).filter(
        EmailMessage.user_id == user.id,
        EmailMessage.subject.ilike(term) | EmailMessage.snippet.ilike(term) | EmailMessage.sender_name.ilike(term),
    ).limit(5).all()

    # Jobs
    jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.title.ilike(term) | Job.company_name.ilike(term) | Job.description.ilike(term),
    ).limit(5).all()

    # Courses & Assignments
    assignments = db.query(Assignment).filter(
        Assignment.user_id == user.id,
        Assignment.title.ilike(term) | Assignment.description.ilike(term),
    ).limit(5).all()

    # Applications & Interviews
    interviews = db.query(Interview).filter(
        Interview.user_id == user.id,
        Interview.company_name.ilike(term) | Interview.role_title.ilike(term),
    ).limit(5).all()

    return {
        "tasks": [{"id": t.id, "title": t.title, "priority": t.priority, "status": t.status, "type": "task", "link": "/planner"} for t in tasks],
        "events": [{"id": e.id, "title": e.title, "start_at": e.start_at.strftime("%b %d, %H:%M"), "type": "event", "link": "/calendar"} for e in events],
        "emails": [{"id": em.id, "title": em.subject, "sender": em.sender_name or em.sender_email, "type": "email", "link": "/inbox"} for em in emails],
        "jobs": [{"id": j.id, "title": f"{j.title} at {j.company_name}", "location": j.location, "type": "job", "link": "/jobs"} for j in jobs],
        "assignments": [{"id": a.id, "title": a.title, "due_at": a.due_at.strftime("%b %d"), "type": "assignment", "link": "/academics"} for a in assignments],
        "interviews": [{"id": i.id, "title": f"{i.company_name} — {i.round_name}", "type": "interview", "link": "/interviews"} for i in interviews],
    }
