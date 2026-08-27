from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.application import FollowUp, Interview, JobApplication
from app.models.career import Job
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
    FollowUpActionRequest,
    FollowUpResponse,
    InterviewResponse,
)

router = APIRouter(prefix="/applications", tags=["Job Applications & Pipeline"])


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(JobApplication).filter(JobApplication.user_id == user.id)
    if status_filter:
        query = query.filter(JobApplication.status == status_filter)

    apps = query.order_by(JobApplication.applied_at.desc()).all()
    results = []
    for a in apps:
        ivs = [InterviewResponse.model_validate(iv) for iv in a.interviews]
        fus = [
            FollowUpResponse(
                id=f.id,
                application_id=f.application_id,
                company_name=a.company_name,
                role_title=a.role_title,
                recommended_at=f.recommended_at,
                due_date=f.due_date,
                suggested_message=f.suggested_message,
                status=f.status,
                notes=f.notes,
            )
            for f in a.follow_ups
        ]

        results.append(
            ApplicationResponse(
                id=a.id,
                user_id=a.user_id,
                job_id=a.job_id,
                company_name=a.company_name,
                role_title=a.role_title,
                platform=a.platform,
                applied_at=a.applied_at,
                status=a.status,
                recruiter_name=a.recruiter_name,
                recruiter_email=a.recruiter_email,
                location=a.location,
                salary_offered=a.salary_offered,
                notes=a.notes,
                follow_up_date=a.follow_up_date,
                last_status_change_at=a.last_status_change_at,
                interviews=ivs,
                follow_ups=fus,
                created_at=a.created_at,
            )
        )
    return results


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    req: ApplicationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    app = JobApplication(
        user_id=user.id,
        job_id=req.job_id,
        company_name=req.company_name,
        role_title=req.role_title,
        platform=req.platform,
        status=req.status,
        applied_at=req.applied_at or now,
        recruiter_name=req.recruiter_name,
        recruiter_email=req.recruiter_email,
        location=req.location,
        salary_offered=req.salary_offered,
        notes=req.notes,
        cover_letter=req.cover_letter,
        follow_up_date=now + timedelta(days=7),
    )
    db.add(app)
    db.flush()

    # Automatically add a pending follow-up recommendation if status is APPLIED
    if req.status == "APPLIED":
        db.add(FollowUp(
            application_id=app.id,
            user_id=user.id,
            due_date=now + timedelta(days=7),
            suggested_message=f"Hi {req.recruiter_name or 'Hiring Team'}, I wanted to follow up on my application for the {req.role_title} role at {req.company_name}. I look forward to hearing about next steps!",
            status="PENDING",
        ))

    db.commit()
    db.refresh(app)

    return list_applications(user=user, db=db)[0]


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    req: ApplicationUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == user.id,
    ).first()
    if not app:
        raise NotFoundException(message="Application not found.")

    update_data = req.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] != app.status:
        app.status = update_data["status"]
        app.last_status_change_at = datetime.now(timezone.utc)

    for k, v in update_data.items():
        if k != "status":
            setattr(app, k, v)

    db.commit()
    db.refresh(app)

    return [a for a in list_applications(user=user, db=db) if a.id == app.id][0]


@router.get("/follow-ups", response_model=List[FollowUpResponse])
def list_follow_ups(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(FollowUp, JobApplication)\
        .join(JobApplication, FollowUp.application_id == JobApplication.id)\
        .filter(FollowUp.user_id == user.id, FollowUp.status == "PENDING")\
        .order_by(FollowUp.due_date).all()

    return [
        FollowUpResponse(
            id=f.id,
            application_id=f.application_id,
            company_name=a.company_name,
            role_title=a.role_title,
            recommended_at=f.recommended_at,
            due_date=f.due_date,
            suggested_message=f.suggested_message,
            status=f.status,
            notes=f.notes,
        )
        for f, a in items
    ]


@router.post("/follow-ups/{follow_up_id}/action")
def resolve_follow_up(
    follow_up_id: str,
    req: FollowUpActionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fu = db.query(FollowUp).filter(FollowUp.id == follow_up_id, FollowUp.user_id == user.id).first()
    if not fu:
        raise NotFoundException(message="Follow-up not found.")

    fu.status = req.status
    if req.status == "SNOOZED":
        days = req.snooze_days or 7
        fu.due_date = datetime.now(timezone.utc) + timedelta(days=days)
        fu.status = "PENDING"

    db.commit()
    return {"message": f"Follow-up updated to {req.status}."}
