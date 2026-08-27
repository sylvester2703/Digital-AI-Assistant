import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.career import Job, JobMatch, JobSkill, UserSkill
from app.models.user import Profile


def calculate_job_match(
    user_id: str,
    job: Job,
    user_skills: List[str],
    profile: Optional[Profile],
) -> Dict[str, Any]:
    """
    Deterministically computes the multi-factor match score (0-100%) between a User and a Job.
    Returns score components, matched skills, missing skills, and a transparent rationale.
    """
    job_skills_list = [s.skill_name.lower().strip() for s in job.skills]
    user_skills_set = {s.lower().strip() for s in user_skills}

    # 1. Skill Match (Weight: 45%)
    matched_skills = []
    missing_skills = []
    
    if job_skills_list:
        for js in job_skills_list:
            if js in user_skills_set:
                matched_skills.append(js)
            else:
                missing_skills.append(js)
        skill_score = (len(matched_skills) / len(job_skills_list)) * 100.0
    else:
        skill_score = 75.0  # Baseline if job has no listed skills

    # 2. Target Role Match (Weight: 20%)
    role_score = 40.0
    target_roles = []
    if profile and profile.target_roles:
        try:
            target_roles = json.loads(profile.target_roles)
        except Exception:
            target_roles = [profile.target_roles]
    
    job_title_lower = job.title.lower()
    if target_roles:
        for tr in target_roles:
            tr_clean = tr.lower().strip()
            if tr_clean in job_title_lower or any(word in job_title_lower for word in tr_clean.split() if len(word) > 3):
                role_score = 100.0
                break
    else:
        # Default role match
        role_score = 70.0

    # 3. Location & Work-mode Match (Weight: 15%)
    loc_score = 50.0
    remote_pref = profile.remote_pref if profile else "ANY"
    if remote_pref == "ANY" or job.work_mode == "REMOTE" or job.work_mode == remote_pref:
        loc_score += 30.0
        
    target_locations = []
    if profile and profile.target_locations:
        try:
            target_locations = json.loads(profile.target_locations)
        except Exception:
            target_locations = [profile.target_locations]
            
    job_loc_lower = job.location.lower()
    if target_locations:
        for loc in target_locations:
            if loc.lower().strip() in job_loc_lower:
                loc_score += 20.0
                break
    else:
        loc_score += 20.0
        
    loc_score = min(100.0, loc_score)

    # 4. Experience Level Match (Weight: 10%)
    exp_score = 80.0
    if job.experience_level in ["ENTRY_LEVEL", "INTERNSHIP"]:
        exp_score = 100.0
    elif job.experience_level == "MID_LEVEL":
        exp_score = 75.0
    else:
        exp_score = 50.0

    # 5. Freshness Match (Weight: 10%)
    fresh_score = 50.0
    if job.posted_at:
        now = datetime.now(timezone.utc)
        posted = job.posted_at.replace(tzinfo=timezone.utc) if job.posted_at.tzinfo is None else job.posted_at
        age_days = (now - posted).total_seconds() / 86400.0
        if age_days <= 3:
            fresh_score = 100.0
        elif age_days <= 7:
            fresh_score = 85.0
        elif age_days <= 14:
            fresh_score = 70.0
        else:
            fresh_score = 40.0

    # Weighted Total
    total_score = (
        (skill_score * 0.45) +
        (role_score * 0.20) +
        (loc_score * 0.15) +
        (exp_score * 0.10) +
        (fresh_score * 0.10)
    )
    total_score = round(max(0.0, min(100.0, total_score)), 1)

    # Rationale generation
    rationale_bullets = []
    if skill_score >= 70:
        rationale_bullets.append(f"Strong skill alignment: {len(matched_skills)} of your listed skills match.")
    elif missing_skills:
        rationale_bullets.append(f"Skill gaps to bridge: missing {', '.join([s.title() for s in missing_skills[:3]])}.")

    if role_score >= 80:
        rationale_bullets.append(f"Role title fits your target career interests ({job.title}).")

    if job.work_mode == "REMOTE":
        rationale_bullets.append("Offers flexible Remote work mode.")
    elif loc_score >= 80:
        rationale_bullets.append(f"Location in {job.location} aligns with your preferences.")

    if fresh_score >= 80:
        rationale_bullets.append("Recently posted opportunity with active candidate review.")

    explanation_json = {
        "rationale": " • ".join(rationale_bullets) if rationale_bullets else "Standard match criteria satisfied.",
        "skill_score": round(skill_score, 1),
        "role_score": round(role_score, 1),
        "location_score": round(loc_score, 1),
        "experience_score": round(exp_score, 1),
        "freshness_score": round(fresh_score, 1),
    }

    return {
        "total_score": total_score,
        "skill_score": round(skill_score, 1),
        "role_score": round(role_score, 1),
        "location_score": round(loc_score, 1),
        "experience_score": round(exp_score, 1),
        "freshness_score": round(fresh_score, 1),
        "matched_skills": [s.title() for s in matched_skills],
        "missing_skills": [s.title() for s in missing_skills],
        "explanation_json": explanation_json,
    }


def refresh_user_job_matches(db: Session, user_id: str):
    """
    Refreshes deterministic JobMatch records for a user across all active jobs.
    """
    user_skills_objs = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    user_skills = [s.skill_name for s in user_skills_objs]
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    jobs = db.query(Job).filter(Job.is_active == True).all()
    for job in jobs:
        calc = calculate_job_match(user_id, job, user_skills, profile)
        match = db.query(JobMatch).filter(
            JobMatch.user_id == user_id,
            JobMatch.job_id == job.id,
        ).first()

        if not match:
            match = JobMatch(
                user_id=user_id,
                job_id=job.id,
            )
            db.add(match)

        match.total_score = calc["total_score"]
        match.skill_score = calc["skill_score"]
        match.role_score = calc["role_score"]
        match.location_score = calc["location_score"]
        match.experience_score = calc["experience_score"]
        match.freshness_score = calc["freshness_score"]
        match.matched_skills = json.dumps(calc["matched_skills"])
        match.missing_skills = json.dumps(calc["missing_skills"])
        match.explanation_json = json.dumps(calc["explanation_json"])
        match.calculated_at = datetime.now(timezone.utc)

    db.commit()
