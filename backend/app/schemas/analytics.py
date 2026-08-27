from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AcademicAnalytics(BaseModel):
    assignments_total: int
    assignments_completed: int
    assignments_pending: int
    assignments_overdue: int
    completion_rate_percent: float
    workload_by_course: List[Dict[str, Any]]


class CareerAnalytics(BaseModel):
    jobs_saved: int
    applications_total: int
    interviews_scheduled: int
    offers_received: int
    rejections: int
    response_rate_percent: float
    interview_conversion_percent: float
    funnel_stages: List[Dict[str, Any]]


class ProductivityAnalytics(BaseModel):
    tasks_total: int
    tasks_completed: int
    tasks_pending: int
    tasks_overdue: int
    completion_rate_percent: float
    priority_distribution: Dict[str, int]
    daily_completion_trend: List[Dict[str, Any]]


class SkillGapAnalytics(BaseModel):
    user_skills_count: int
    top_in_demand_skills: List[Dict[str, Any]]
    missing_critical_skills: List[Dict[str, Any]]
    recommended_learning: List[str]


class DashboardOverviewMetrics(BaseModel):
    critical_tasks_count: int
    upcoming_deadlines_count: int
    next_interview: Optional[Dict[str, Any]] = None
    important_emails_count: int
    top_job_matches_count: int
    has_schedule_conflicts: bool
    greeting_name: str
    today_date_str: str
