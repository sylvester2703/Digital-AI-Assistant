from datetime import datetime, timezone
from typing import Optional, Tuple


def calculate_task_priority(
    due_at: Optional[datetime],
    source_type: str = "MANUAL",
    user_priority: Optional[str] = None,
    linked_entity_type: Optional[str] = None,
) -> Tuple[str, float]:
    """
    Deterministically calculates priority level (CRITICAL, HIGH, MEDIUM, LOW)
    and a numeric score from 0.0 to 100.0 based on explicit business rules:
    - Deadline urgency (hours until due)
    - Source type (EMAIL actionable item, CLASSROOM assignment, INTERVIEW prep)
    - User explicit preference override / baseline
    """
    base_score = 50.0
    
    # 1. User specified baseline
    if user_priority == "CRITICAL":
        base_score = 85.0
    elif user_priority == "HIGH":
        base_score = 70.0
    elif user_priority == "MEDIUM":
        base_score = 50.0
    elif user_priority == "LOW":
        base_score = 30.0

    # 2. Source weighting
    if source_type in ["INTERVIEW", "EXAM"] or linked_entity_type in ["INTERVIEW", "EXAM"]:
        base_score += 20.0
    elif source_type in ["CLASSROOM", "ASSIGNMENT"] or linked_entity_type in ["ASSIGNMENT"]:
        base_score += 15.0
    elif source_type == "EMAIL":
        base_score += 10.0

    # 3. Deadline proximity
    if due_at:
        now = datetime.now(timezone.utc)
        # Ensure due_at has timezone
        if due_at.tzinfo is None:
            due_at = due_at.replace(tzinfo=timezone.utc)
            
        diff_hours = (due_at - now).total_seconds() / 3600.0
        
        if diff_hours < 0:
            # Overdue
            base_score += 25.0
        elif diff_hours <= 12:
            # Due in less than 12 hours
            base_score += 30.0
        elif diff_hours <= 24:
            # Due in 1 day
            base_score += 20.0
        elif diff_hours <= 72:
            # Due in 3 days
            base_score += 10.0
        elif diff_hours <= 168:
            # Due in 1 week
            base_score += 5.0
        else:
            base_score -= 5.0

    # Clamp score to 0.0 - 100.0
    final_score = max(0.0, min(100.0, base_score))

    # Map score to label
    if final_score >= 80.0:
        priority_label = "CRITICAL"
    elif final_score >= 65.0:
        priority_label = "HIGH"
    elif final_score >= 40.0:
        priority_label = "MEDIUM"
    else:
        priority_label = "LOW"

    return priority_label, round(final_score, 1)
