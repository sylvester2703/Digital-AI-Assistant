import json
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.career import UserSkill
from app.models.user import Profile, User
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest, UserSkillCreate, UserSkillResponse
from app.services.job_matcher import refresh_user_job_matches

router = APIRouter(prefix="/profile", tags=["Profile & Skills"])


@router.get("", response_model=ProfileResponse)
def get_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
    
    target_roles = json.loads(profile.target_roles) if profile.target_roles else []
    target_locations = json.loads(profile.target_locations) if profile.target_locations else []
    certifications = json.loads(profile.certifications) if profile.certifications else []

    return ProfileResponse(
        id=profile.id,
        user_id=user.id,
        headline=profile.headline,
        bio=profile.bio,
        education=profile.education,
        degree=profile.degree,
        branch=profile.branch,
        grad_year=profile.grad_year,
        target_roles=target_roles,
        target_locations=target_locations,
        remote_pref=profile.remote_pref,
        employment_pref=profile.employment_pref,
        expected_salary=profile.expected_salary,
        expected_stipend=profile.expected_stipend,
        portfolio_url=profile.portfolio_url,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        certifications=certifications,
        skills=[UserSkillResponse.model_validate(s) for s in skills],
    )


@router.patch("", response_model=ProfileResponse)
def update_user_profile(
    req: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    update_data = req.model_dump(exclude_unset=True)
    
    if "target_roles" in update_data and update_data["target_roles"] is not None:
        profile.target_roles = json.dumps(update_data["target_roles"])
    if "target_locations" in update_data and update_data["target_locations"] is not None:
        profile.target_locations = json.dumps(update_data["target_locations"])
    if "certifications" in update_data and update_data["certifications"] is not None:
        profile.certifications = json.dumps(update_data["certifications"])

    for field in ["headline", "bio", "education", "degree", "branch", "grad_year", "remote_pref", "employment_pref", "expected_salary", "expected_stipend", "portfolio_url", "github_url", "linkedin_url"]:
        if field in update_data and update_data[field] is not None:
            setattr(profile, field, update_data[field])

    db.commit()
    db.refresh(profile)

    # Recompute job matches with updated profile criteria
    refresh_user_job_matches(db, user.id)

    return get_user_profile(user=user, db=db)


@router.post("/skills", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def add_user_skill(
    req: UserSkillCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    clean_name = req.skill_name.strip()
    existing = db.query(UserSkill).filter(
        UserSkill.user_id == user.id,
        UserSkill.skill_name.ilike(clean_name),
    ).first()
    
    if existing:
        existing.proficiency = req.proficiency
        existing.years_experience = req.years_experience
        db.commit()
        db.refresh(existing)
        refresh_user_job_matches(db, user.id)
        return existing

    skill = UserSkill(
        user_id=user.id,
        skill_name=clean_name,
        proficiency=req.proficiency,
        years_experience=req.years_experience,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    refresh_user_job_matches(db, user.id)
    return skill


@router.delete("/skills/{skill_id}")
def delete_user_skill(
    skill_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(UserSkill).filter(
        UserSkill.id == skill_id,
        UserSkill.user_id == user.id,
    ).first()
    if not skill:
        raise NotFoundException(message="Skill record not found.")

    db.delete(skill)
    db.commit()

    refresh_user_job_matches(db, user.id)
    return {"message": "Skill removed successfully."}
