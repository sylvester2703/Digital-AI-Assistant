import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.application import JobApplication
from app.models.career import Job, JobMatch, JobSkill, Skill
from app.models.user import User
from app.schemas.career import JobCreate, JobResponse, JobSkillResponse, SkillResponse
from app.services.job_matcher import refresh_user_job_matches

router = APIRouter(prefix="/jobs", tags=["Career & Opportunities"])


@router.get("", response_model=List[JobResponse])
def list_jobs(
    query: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    min_match: Optional[float] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Ensure match scores are calculated
    job_query = db.query(Job).filter(Job.is_active == True)

    if query:
        term = f"%{query}%"
        job_query = job_query.filter(Job.title.ilike(term) | Job.company_name.ilike(term) | Job.description.ilike(term))
    if role:
        job_query = job_query.filter(Job.title.ilike(f"%{role}%"))
    if location:
        job_query = job_query.filter(Job.location.ilike(f"%{location}%"))
    if work_mode:
        job_query = job_query.filter(Job.work_mode == work_mode)
    if employment_type:
        job_query = job_query.filter(Job.employment_type == employment_type)

    jobs = job_query.all()
    user_matches = {m.job_id: m for m in db.query(JobMatch).filter(JobMatch.user_id == user.id).all()}
    user_apps = {a.job_id: a for a in db.query(JobApplication).filter(JobApplication.user_id == user.id).all()}

    results = []
    for j in jobs:
        match_obj = user_matches.get(j.id)
        match_score = match_obj.total_score if match_obj else 70.0
        skill_score = match_obj.skill_score if match_obj else 70.0
        matched_skills = json.loads(match_obj.matched_skills) if match_obj and match_obj.matched_skills else []
        missing_skills = json.loads(match_obj.missing_skills) if match_obj and match_obj.missing_skills else []
        
        rationale = ""
        if match_obj and match_obj.explanation_json:
            try:
                exp = json.loads(match_obj.explanation_json)
                rationale = exp.get("rationale", "")
            except Exception:
                pass

        if min_match is not None and match_score < min_match:
            continue

        app_obj = user_apps.get(j.id)
        is_saved = app_obj.status == "SAVED" if app_obj else False
        is_applied = (app_obj.status not in ["SAVED", "WITHDRAWN"]) if app_obj else False

        job_resp = JobResponse(
            id=j.id,
            company_name=j.company_name,
            title=j.title,
            description=j.description,
            location=j.location,
            work_mode=j.work_mode,
            employment_type=j.employment_type,
            experience_level=j.experience_level,
            min_salary=j.min_salary,
            max_salary=j.max_salary,
            salary_currency=j.salary_currency,
            canonical_url=j.canonical_url,
            source_name=j.source_name,
            posted_at=j.posted_at,
            deadline_at=j.deadline_at,
            skills=[JobSkillResponse(id=s.id, skill_name=s.skill_name, is_required=s.is_required) for s in j.skills],
            match_score=match_score,
            skill_score=skill_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            match_rationale=rationale,
            is_saved=is_saved,
            is_applied=is_applied,
        )
        results.append(job_resp)

    # Sort descending by match score
    results.sort(key=lambda x: x.match_score or 0.0, reverse=True)
    return results


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_manual_job(
    req: JobCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = Job(
        company_name=req.company_name,
        title=req.title,
        description=req.description,
        location=req.location,
        work_mode=req.work_mode,
        employment_type=req.employment_type,
        experience_level=req.experience_level,
        min_salary=req.min_salary,
        max_salary=req.max_salary,
        salary_currency=req.salary_currency,
        canonical_url=req.canonical_url,
        source_name="MANUAL",
    )
    db.add(job)
    db.flush()

    for sk in req.skills:
        db.add(JobSkill(job_id=job.id, skill_name=sk, is_required=True))

    db.commit()
    refresh_user_job_matches(db, user.id)

    return list_jobs(query=job.title, user=user, db=db)[0]


@router.get("/skills", response_model=List[SkillResponse])
def get_all_canonical_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).all()
    return skills
