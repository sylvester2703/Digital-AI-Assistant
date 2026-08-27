import re
from typing import Any, Dict, List, Set


def extract_keywords_from_text(text: str) -> Set[str]:
    """
    Extracts normalized technical and domain keywords from a text body.
    """
    if not text:
        return set()
    words = re.findall(r"\b[A-Za-z0-9\+#\.]+\b", text)
    cleaned = set()
    for w in words:
        w_lower = w.lower()
        if len(w_lower) >= 2:
            cleaned.add(w_lower)
    return cleaned


def analyze_resume_fit(
    resume_text: str,
    job_description: str,
    job_skills: List[str],
    user_skills: List[str],
) -> Dict[str, Any]:
    """
    Deterministically computes:
    - Profile Match: How well user skills align with job requirements
    - Resume Match: How thoroughly the resume document reflects those keywords
    - Matched and missing keywords with recommendations
    """
    resume_keywords = extract_keywords_from_text(resume_text)
    
    # 1. Profile Match based on listed user skills
    user_skills_set = {s.lower().strip() for s in user_skills}
    job_skills_set = {s.lower().strip() for s in job_skills}
    
    matched_skills = user_skills_set.intersection(job_skills_set)
    if job_skills_set:
        profile_score = (len(matched_skills) / len(job_skills_set)) * 100.0
    else:
        profile_score = 75.0

    # 2. Resume Document Match based on job skills found in text
    matched_in_resume = []
    missing_in_resume = []
    
    for js in job_skills_set:
        if js in resume_keywords or any(token in resume_keywords for token in js.split()):
            matched_in_resume.append(js)
        else:
            missing_in_resume.append(js)
            
    if job_skills_set:
        resume_score = (len(matched_in_resume) / len(job_skills_set)) * 100.0
    else:
        resume_score = 70.0

    # Suggestions
    suggestions = []
    if missing_in_resume:
        suggestions.append(f"Consider explicitly mentioning experience with {', '.join([k.title() for k in missing_in_resume[:4]])} in your projects or summary.")
    if profile_score > resume_score:
        suggestions.append("You have skills in your profile that aren't prominent in this resume version. Add relevant coursework or project bullets.")
    else:
        suggestions.append("Good coverage of target role requirements in this resume draft.")

    return {
        "profile_match_score": round(profile_score, 1),
        "resume_match_score": round(resume_score, 1),
        "matched_keywords": [k.title() for k in matched_in_resume],
        "missing_keywords": [k.title() for k in missing_in_resume],
        "suggestions": suggestions,
    }
