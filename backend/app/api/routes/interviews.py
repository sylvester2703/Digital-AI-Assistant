import json
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.application import Interview, JobApplication
from app.models.user import User
from app.schemas.ai import InterviewPrepResponse
from app.schemas.application import InterviewCreate, InterviewResponse, InterviewUpdate
from app.services.ai_service import AIService
from app.services.conflict_detector import evaluate_event_conflicts

router = APIRouter(prefix="/interviews", tags=["Interviews & Prep"])


@router.get("", response_model=List[InterviewResponse])
def list_interviews(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    interviews = db.query(Interview).filter(Interview.user_id == user.id).order_by(Interview.start_at).all()
    return interviews


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    req: InterviewCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    has_conflict, _ = evaluate_event_conflicts(db, user.id, None, req.start_at, req.end_at)

    interview = Interview(
        user_id=user.id,
        application_id=req.application_id,
        company_name=req.company_name,
        role_title=req.role_title,
        round_name=req.round_name,
        round_number=req.round_number,
        start_at=req.start_at,
        end_at=req.end_at,
        interview_type=req.interview_type,
        meeting_link=req.meeting_link,
        interviewer_info=req.interviewer_info,
        notes=req.notes,
        conflicts_detected=has_conflict,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.patch("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: str,
    req: InterviewUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id,
    ).first()
    if not interview:
        raise NotFoundException(message="Interview not found.")

    update_data = req.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(interview, k, v)

    if "start_at" in update_data or "end_at" in update_data:
        has_conflict, _ = evaluate_event_conflicts(db, user.id, None, interview.start_at, interview.end_at)
        interview.conflicts_detected = has_conflict

    db.commit()
    db.refresh(interview)
    return interview


@router.get("/{interview_id}/prep", response_model=InterviewPrepResponse)
def get_or_generate_interview_prep(
    interview_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id,
    ).first()
    if not interview:
        raise NotFoundException(message="Interview not found.")

    prep = AIService.generate_interview_prep(db, user, interview)

    return InterviewPrepResponse(
        id=prep.id,
        interview_id=prep.interview_id,
        company_overview=prep.company_overview,
        role_summary=prep.role_summary,
        top_skills=json.loads(prep.top_skills_json),
        technical_questions=json.loads(prep.technical_questions_json),
        behavioral_questions=json.loads(prep.behavioral_questions_json),
        sql_questions=json.loads(prep.sql_questions_json),
        python_questions=json.loads(prep.python_questions_json),
        questions_to_ask=json.loads(prep.questions_to_ask_json),
        preparation_checklist=json.loads(prep.preparation_checklist_json),
    )
