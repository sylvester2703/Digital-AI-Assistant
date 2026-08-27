from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.career import Job, UserSkill
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeMatchResponse, ResumeResponse, ResumeVersionResponse
from app.services.resume_analyzer import analyze_resume_fit

router = APIRouter(prefix="/resumes", tags=["Resumes & Analysis"])


@router.get("", response_model=List[ResumeResponse])
def list_resumes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == user.id).all()
    results = []
    for r in resumes:
        results.append(
            ResumeResponse(
                id=r.id,
                user_id=r.user_id,
                title=r.title,
                target_role=r.target_role,
                is_default=r.is_default,
                file_name=r.file_name,
                file_size_bytes=r.file_size_bytes,
                extracted_text=r.extracted_text,
                versions=[ResumeVersionResponse.model_validate(v) for v in r.versions],
                created_at=r.created_at,
            )
        )
    return results


@router.get("/analyze-fit", response_model=ResumeMatchResponse)
def analyze_resume_for_job(
    resume_id: str = Query(...),
    job_id: str = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise NotFoundException(message="Resume document not found.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise NotFoundException(message="Job opportunity not found.")

    job_skills = [s.skill_name for s in job.skills]
    user_skills = [s.skill_name for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()]

    result = analyze_resume_fit(
        resume_text=resume.extracted_text or "",
        job_description=job.description,
        job_skills=job_skills,
        user_skills=user_skills,
    )

    return ResumeMatchResponse(
        resume_id=resume.id,
        job_id=job.id,
        profile_match_score=result["profile_match_score"],
        resume_match_score=result["resume_match_score"],
        matched_keywords=result["matched_keywords"],
        missing_keywords=result["missing_keywords"],
        suggestions=result["suggestions"],
    )
