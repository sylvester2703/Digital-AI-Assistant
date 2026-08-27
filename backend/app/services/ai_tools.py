import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.academic import Assignment, Course
from app.models.application import FollowUp, Interview, JobApplication
from app.models.calendar_event import CalendarEvent
from app.models.career import Job, JobMatch, UserSkill
from app.models.email import EmailMessage, ExtractedFact
from app.models.task import Task
from app.models.user import Profile, User
from app.services.priority_engine import calculate_task_priority


def tool_get_today_schedule(db: Session, user_id: str, **kwargs) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    start_of_day = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
    end_of_day = start_of_day + timedelta(days=1)

    events = db.query(CalendarEvent).filter(
        CalendarEvent.user_id == user_id,
        CalendarEvent.start_at >= start_of_day,
        CalendarEvent.start_at < end_of_day,
    ).order_by(CalendarEvent.start_at).all()

    interviews = db.query(Interview).filter(
        Interview.user_id == user_id,
        Interview.start_at >= start_of_day,
        Interview.start_at < end_of_day,
        Interview.status.in_(["SCHEDULED", "RESCHEDULED"]),
    ).all()

    return {
        "date": start_of_day.strftime("%Y-%m-%d"),
        "events_count": len(events),
        "events": [
            {
                "id": e.id,
                "title": e.title,
                "event_type": e.event_type,
                "start_time": e.start_at.strftime("%H:%M"),
                "end_time": e.end_at.strftime("%H:%M"),
                "location": e.location,
                "meeting_url": e.meeting_url,
                "has_conflict": e.has_conflict,
            }
            for e in events
        ],
        "interviews": [
            {
                "id": i.id,
                "company": i.company_name,
                "role": i.role_title,
                "round": i.round_name,
                "start_time": i.start_at.strftime("%H:%M"),
                "meeting_link": i.meeting_link,
            }
            for i in interviews
        ],
    }


def tool_get_tasks(db: Session, user_id: str, status: Optional[str] = "TODO", priority: Optional[str] = None, **kwargs) -> Dict[str, Any]:
    query = db.query(Task).filter(Task.user_id == user_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    
    tasks = query.order_by(desc(Task.calculated_score)).limit(10).all()
    return {
        "count": len(tasks),
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "priority": t.priority,
                "score": t.calculated_score,
                "status": t.status,
                "due_at": t.due_at.strftime("%Y-%m-%d %H:%M") if t.due_at else None,
                "source": t.source_type,
            }
            for t in tasks
        ],
    }


def tool_get_upcoming_deadlines(db: Session, user_id: str, days: int = 7, **kwargs) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(days=days)

    assignments = db.query(Assignment).filter(
        Assignment.user_id == user_id,
        Assignment.due_at >= now,
        Assignment.due_at <= cutoff,
        Assignment.submission_status != "SUBMITTED",
    ).order_by(Assignment.due_at).all()

    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.due_at >= now,
        Task.due_at <= cutoff,
        Task.status.in_(["TODO", "IN_PROGRESS"]),
    ).order_by(Task.due_at).all()

    return {
        "window_days": days,
        "assignments": [
            {
                "id": a.id,
                "title": a.title,
                "due_at": a.due_at.strftime("%Y-%m-%d %H:%M"),
                "priority": a.priority,
            }
            for a in assignments
        ],
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "due_at": t.due_at.strftime("%Y-%m-%d %H:%M"),
                "priority": t.priority,
            }
            for t in tasks
        ],
    }


def tool_get_upcoming_interviews(db: Session, user_id: str, **kwargs) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    interviews = db.query(Interview).filter(
        Interview.user_id == user_id,
        Interview.start_at >= now,
        Interview.status.in_(["SCHEDULED", "RESCHEDULED"]),
    ).order_by(Interview.start_at).limit(5).all()

    return {
        "count": len(interviews),
        "interviews": [
            {
                "id": i.id,
                "company": i.company_name,
                "role": i.role_title,
                "round": i.round_name,
                "start_at": i.start_at.strftime("%Y-%m-%d %H:%M"),
                "interview_type": i.interview_type,
                "meeting_link": i.meeting_link,
                "prep_progress": f"{i.prep_progress_percent}%",
                "conflicts_detected": i.conflicts_detected,
            }
            for i in interviews
        ],
    }


def tool_get_important_emails(db: Session, user_id: str, **kwargs) -> Dict[str, Any]:
    emails = db.query(EmailMessage).filter(
        EmailMessage.user_id == user_id,
        EmailMessage.category.in_(["INTERVIEW", "OFFER", "ASSESSMENT", "JOB_OPPORTUNITY", "ASSIGNMENT", "EXAM", "IMPORTANT"]),
    ).order_by(desc(EmailMessage.received_at)).limit(8).all()

    return {
        "count": len(emails),
        "emails": [
            {
                "id": e.id,
                "sender": e.sender_name or e.sender_email,
                "subject": e.subject,
                "category": e.category,
                "priority": e.priority,
                "received_at": e.received_at.strftime("%Y-%m-%d %H:%M"),
                "summary": e.summary,
                "is_actionable": e.is_actionable,
            }
            for e in emails
        ],
    }


def tool_get_best_job_matches(db: Session, user_id: str, limit: int = 5, min_score: float = 70.0, **kwargs) -> Dict[str, Any]:
    matches = db.query(JobMatch, Job).join(Job, JobMatch.job_id == Job.id).filter(
        JobMatch.user_id == user_id,
        Job.is_active == True,
        JobMatch.total_score >= min_score,
    ).order_by(desc(JobMatch.total_score)).limit(limit).all()

    results = []
    for match, job in matches:
        matched_skills = json.loads(match.matched_skills) if match.matched_skills else []
        missing_skills = json.loads(match.missing_skills) if match.missing_skills else []
        results.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company_name,
            "location": job.location,
            "work_mode": job.work_mode,
            "match_score": f"{match.total_score}%",
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "source": job.source_name,
        })

    return {
        "count": len(results),
        "top_matches": results,
    }


def tool_get_followups(db: Session, user_id: str, **kwargs) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    followups = db.query(FollowUp).filter(
        FollowUp.user_id == user_id,
        FollowUp.status == "PENDING",
    ).order_by(FollowUp.due_date).all()

    return {
        "count": len(followups),
        "follow_ups": [
            {
                "id": f.id,
                "company": f.company_name,
                "role": f.role_title,
                "due_date": f.due_date.strftime("%Y-%m-%d"),
                "suggested_message": f.suggested_message,
            }
            for f in followups
        ],
    }


def tool_create_task_draft(db: Session, user_id: str, title: str, due_at: Optional[str] = None, priority: str = "MEDIUM", **kwargs) -> Dict[str, Any]:
    due_dt = None
    if due_at:
        try:
            due_dt = datetime.fromisoformat(due_at)
        except Exception:
            pass

    p_label, score = calculate_task_priority(due_dt, "AI_SUGGESTION", priority)
    task = Task(
        user_id=user_id,
        title=title,
        priority=p_label,
        calculated_score=score,
        status="TODO",
        due_at=due_dt,
        source_type="AI_SUGGESTION",
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "success": True,
        "task_id": task.id,
        "title": task.title,
        "priority": task.priority,
        "score": task.calculated_score,
        "message": f"Task '{task.title}' created successfully."
    }


TOOL_REGISTRY = {
    "get_today_schedule": tool_get_today_schedule,
    "get_tasks": tool_get_tasks,
    "get_upcoming_deadlines": tool_get_upcoming_deadlines,
    "get_upcoming_interviews": tool_get_upcoming_interviews,
    "get_important_emails": tool_get_important_emails,
    "get_best_job_matches": tool_get_best_job_matches,
    "get_followups": tool_get_followups,
    "create_task_draft": tool_create_task_draft,
}
