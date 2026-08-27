from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.calendar_event import CalendarEvent
from app.models.application import Interview


def check_time_overlap(
    start_a: datetime,
    end_a: datetime,
    start_b: datetime,
    end_b: datetime,
) -> bool:
    """
    Deterministic interval overlap calculation:
    start_a < end_b AND end_a > start_b
    """
    return start_a < end_b and end_a > start_b


def evaluate_event_conflicts(
    db: Session,
    user_id: str,
    target_event_id: Optional[str],
    start_at: datetime,
    end_at: datetime,
) -> Tuple[bool, List[str]]:
    """
    Evaluates whether the specified event interval overlaps with any other
    scheduled calendar events or scheduled interviews for the user.
    """
    conflicts_notes = []
    has_conflict = False

    # 1. Check against other calendar events
    query = db.query(CalendarEvent).filter(
        CalendarEvent.user_id == user_id,
        CalendarEvent.id != target_event_id if target_event_id else True,
    )
    events = query.all()
    for ev in events:
        if check_time_overlap(start_at, end_at, ev.start_at, ev.end_at):
            has_conflict = True
            time_str = f"{ev.start_at.strftime('%H:%M')} - {ev.end_at.strftime('%H:%M')}"
            conflicts_notes.append(f"Overlaps with '{ev.title}' ({ev.event_type}) at {time_str}")

    # 2. Check against scheduled interviews
    interviews = db.query(Interview).filter(
        Interview.user_id == user_id,
        Interview.status.in_(["SCHEDULED", "RESCHEDULED"]),
    ).all()
    for iv in interviews:
        if check_time_overlap(start_at, end_at, iv.start_at, iv.end_at):
            has_conflict = True
            time_str = f"{iv.start_at.strftime('%H:%M')} - {iv.end_at.strftime('%H:%M')}"
            conflicts_notes.append(f"Overlaps with Interview for {iv.company_name} ({iv.role_title}) at {time_str}")

    return has_conflict, conflicts_notes
