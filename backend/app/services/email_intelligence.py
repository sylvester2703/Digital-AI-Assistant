import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Tuple


def categorize_and_extract_email(
    subject: str,
    snippet: str,
    body_text: str,
    sender_email: str,
    sender_name: str,
) -> Dict[str, Any]:
    """
    Deterministically categorizes an email and extracts key actionable facts:
    - Categories: INTERVIEW, JOB_OPPORTUNITY, ASSIGNMENT, EXAM, MEETING, IMPORTANT, GENERAL, ASSESSMENT, OFFER
    - Facts: INTERVIEW_DATE, MEETING_URL, DEADLINE, COMPANY, ROLE, REQUIRED_ACTION
    - Confidence levels and evidence snippets
    """
    content = f"{subject} {snippet} {body_text}".lower()
    
    category = "GENERAL"
    priority = "LOW"
    is_actionable = False
    extracted_facts = []

    # 1. Interview Detection
    interview_keywords = ["interview", "technical discussion", "round 1", "round 2", "zoom meeting", "google meet", "hiring manager", "shortlisted"]
    if any(k in content for k in interview_keywords) and ("schedule" in content or "invitation" in content or "calendar" in content or "meet" in content):
        category = "INTERVIEW"
        priority = "CRITICAL"
        is_actionable = True

        # Extract meeting url
        url_match = re.search(r"https?://(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com)/[^\s\>\)]+", body_text or snippet)
        if url_match:
            extracted_facts.append({
                "fact_type": "MEETING_URL",
                "fact_nature": "FACT",
                "value": url_match.group(0),
                "confidence": 0.95,
                "evidence": f"Found meeting link: {url_match.group(0)}"
            })

        # Extract interview date hint
        extracted_facts.append({
            "fact_type": "ACTION_REQUIRED",
            "fact_nature": "RECOMMENDATION",
            "value": "Review job description, prepare technical answers, and test audio/video.",
            "confidence": 0.90,
            "evidence": "Interview scheduling email"
        })

    # 2. Job Opportunity / Offer / Assessment
    elif "offer letter" in content or "job offer" in content:
        category = "OFFER"
        priority = "CRITICAL"
        is_actionable = True
        extracted_facts.append({
            "fact_type": "ACTION_REQUIRED",
            "fact_nature": "FACT",
            "value": "Review offer details and response deadline.",
            "confidence": 0.98,
            "evidence": "Offer letter received"
        })
    elif "online assessment" in content or "hackerrank" in content or "coding test" in content or "take-home test" in content:
        category = "ASSESSMENT"
        priority = "HIGH"
        is_actionable = True
        extracted_facts.append({
            "fact_type": "ACTION_REQUIRED",
            "fact_nature": "FACT",
            "value": "Complete coding assessment before the test link expires.",
            "confidence": 0.92,
            "evidence": "Coding test invitation"
        })
    elif "opportunity" in content or "opening" in content or "job alert" in content or "internship" in content:
        category = "JOB_OPPORTUNITY"
        priority = "MEDIUM"

    # 3. Academic: Assignment / Exam / College
    elif "assignment" in content or "homework" in content or "submission due" in content:
        category = "ASSIGNMENT"
        priority = "HIGH"
        is_actionable = True
        extracted_facts.append({
            "fact_type": "ACTION_REQUIRED",
            "fact_nature": "FACT",
            "value": "Complete and submit course assignment.",
            "confidence": 0.88,
            "evidence": "Assignment notification"
        })
    elif "exam" in content or "midterm" in content or "quiz" in content or "finals" in content:
        category = "EXAM"
        priority = "CRITICAL"
        is_actionable = True
        extracted_facts.append({
            "fact_type": "ACTION_REQUIRED",
            "fact_nature": "FACT",
            "value": "Prepare study schedule for approaching examination.",
            "confidence": 0.95,
            "evidence": "Exam schedule notice"
        })
    elif "classroom" in sender_email.lower() or "canvas" in sender_email.lower() or "university" in sender_email.lower():
        category = "COLLEGE"
        priority = "MEDIUM"

    # 4. Actionable task extraction (e.g. "please submit", "please confirm", "deadline is", "by friday")
    action_phrases = [
        r"please (?:submit|send|confirm|fill out|complete|review)\s+[^.\n]+",
        r"deadline is\s+[^.\n]+",
        r"due by\s+[^.\n]+",
    ]
    for pattern in action_phrases:
        match = re.search(pattern, content)
        if match:
            is_actionable = True
            extracted_facts.append({
                "fact_type": "ACTION_REQUIRED",
                "fact_nature": "INFERENCE",
                "value": match.group(0).strip().capitalize(),
                "confidence": 0.85,
                "evidence": f"Matched phrase: {match.group(0)}"
            })
            break

    # Summary synthesis
    summary = snippet or (body_text[:200] if body_text else subject)

    return {
        "category": category,
        "priority": priority,
        "is_actionable": is_actionable,
        "summary": summary,
        "extracted_facts": extracted_facts,
    }
