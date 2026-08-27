from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import (
    AcademicAnalytics,
    CareerAnalytics,
    DashboardOverviewMetrics,
    ProductivityAnalytics,
    SkillGapAnalytics,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])


@router.get("/overview", response_model=DashboardOverviewMetrics)
def get_dashboard_overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_metrics(db, user)


@router.get("/academic", response_model=AcademicAnalytics)
def get_academic_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_academic_analytics(db, user)


@router.get("/career", response_model=CareerAnalytics)
def get_career_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_career_analytics(db, user)


@router.get("/productivity", response_model=ProductivityAnalytics)
def get_productivity_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_productivity_analytics(db, user)


@router.get("/skills", response_model=SkillGapAnalytics)
def get_skill_gap_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_skill_gap_analytics(db, user)
