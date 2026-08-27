from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.email import EmailMessage, ExtractedFact
from app.models.task import Task
from app.models.user import User
from app.schemas.email import ConvertFactToTaskRequest, EmailMessageResponse, ExtractedFactResponse
from app.schemas.task import TaskResponse
from app.services.priority_engine import calculate_task_priority

router = APIRouter(prefix="/emails", tags=["Inbox & Email Intelligence"])


@router.get("", response_model=List[EmailMessageResponse])
def list_emails(
    category: Optional[str] = Query(None),
    only_actionable: Optional[bool] = Query(False),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(EmailMessage).filter(EmailMessage.user_id == user.id)
    if category:
        query = query.filter(EmailMessage.category == category)
    if only_actionable:
        query = query.filter(EmailMessage.is_actionable == True)

    emails = query.order_by(desc(EmailMessage.received_at)).all()
    return emails


@router.get("/{email_id}", response_model=EmailMessageResponse)
def get_email_details(
    email_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email = db.query(EmailMessage).filter(
        EmailMessage.id == email_id,
        EmailMessage.user_id == user.id,
    ).first()
    if not email:
        raise NotFoundException(message="Email message not found.")

    if not email.is_read:
        email.is_read = True
        db.commit()
        db.refresh(email)

    return email


@router.post("/facts/{fact_id}/convert-to-task", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def convert_fact_to_task(
    fact_id: str,
    req: ConvertFactToTaskRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fact = db.query(ExtractedFact).filter(
        ExtractedFact.id == fact_id,
        ExtractedFact.user_id == user.id,
    ).first()
    if not fact:
        raise NotFoundException(message="Extracted fact not found.")

    title = req.title or fact.value
    p_label, score = calculate_task_priority(req.due_at, "EMAIL", req.priority)

    task = Task(
        user_id=user.id,
        title=title,
        description=f"Extracted from email fact: {fact.evidence or fact.value}",
        priority=p_label,
        calculated_score=score,
        status="TODO",
        due_at=req.due_at,
        source_type="EMAIL",
        source_id=fact.email_id,
    )
    db.add(task)
    db.flush()

    fact.converted_to_task = True
    fact.converted_task_id = task.id
    fact.is_confirmed_by_user = True

    db.commit()
    db.refresh(task)

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        calculated_score=task.calculated_score,
        status=task.status,
        due_at=task.due_at,
        estimated_duration_minutes=task.estimated_duration_minutes,
        completed_at=task.completed_at,
        source_type=task.source_type,
        source_id=task.source_id,
        tags=[],
        created_at=task.created_at,
        updated_at=task.updated_at,
    )
