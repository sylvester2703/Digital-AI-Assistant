from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import AppException, NotFoundException
from app.db.session import get_db
from app.models.calendar_event import CalendarEvent
from app.models.user import User
from app.schemas.calendar import CalendarEventCreate, CalendarEventResponse, CalendarEventUpdate
from app.services.conflict_detector import evaluate_event_conflicts

router = APIRouter(prefix="/calendar", tags=["Calendar & Events"])


@router.get("", response_model=List[CalendarEventResponse])
def list_calendar_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(CalendarEvent).filter(CalendarEvent.user_id == user.id)

    if start_date:
        try:
            s_dt = datetime.fromisoformat(start_date)
            query = query.filter(CalendarEvent.end_at >= s_dt)
        except Exception:
            pass

    if end_date:
        try:
            e_dt = datetime.fromisoformat(end_date)
            query = query.filter(CalendarEvent.start_at <= e_dt)
        except Exception:
            pass

    events = query.order_by(CalendarEvent.start_at).all()
    return events


@router.post("", response_model=CalendarEventResponse, status_code=status.HTTP_201_CREATED)
def create_calendar_event(
    req: CalendarEventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.end_at <= req.start_at:
        raise AppException(message="Event end time must be strictly after start time.")

    has_conflict, notes = evaluate_event_conflicts(db, user.id, None, req.start_at, req.end_at)

    event = CalendarEvent(
        user_id=user.id,
        title=req.title,
        description=req.description,
        event_type=req.event_type,
        start_at=req.start_at,
        end_at=req.end_at,
        all_day=req.all_day,
        location=req.location,
        meeting_url=req.meeting_url,
        source_type=req.source_type,
        source_id=req.source_id,
        has_conflict=has_conflict,
        conflict_notes="; ".join(notes) if notes else None,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return event


@router.patch("/{event_id}", response_model=CalendarEventResponse)
def update_calendar_event(
    event_id: str,
    req: CalendarEventUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(CalendarEvent).filter(
        CalendarEvent.id == event_id,
        CalendarEvent.user_id == user.id,
    ).first()
    if not event:
        raise NotFoundException(message="Calendar event not found.")

    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(event, field, val)

    if event.end_at <= event.start_at:
        raise AppException(message="Event end time must be strictly after start time.")

    has_conflict, notes = evaluate_event_conflicts(db, user.id, event.id, event.start_at, event.end_at)
    event.has_conflict = has_conflict
    event.conflict_notes = "; ".join(notes) if notes else None

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_calendar_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(CalendarEvent).filter(
        CalendarEvent.id == event_id,
        CalendarEvent.user_id == user.id,
    ).first()
    if not event:
        raise NotFoundException(message="Calendar event not found.")

    db.delete(event)
    db.commit()
    return {"message": "Calendar event deleted successfully."}
