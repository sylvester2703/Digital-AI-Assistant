import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.seed_service import seed_demo_environment

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seed", tags=["Seed & Development"])


@router.post("/demo-data", status_code=status.HTTP_200_OK)
def trigger_seed_demo_data(db: Session = Depends(get_db)):
    try:
        seed_demo_environment(db)
    except Exception as e:
        logger.warning(f"Seed demo data notice: {e}")
        db.rollback()

    return {
        "success": True,
        "message": "Demo data ready.",
        "demo_credentials": {
            "email": "alex.rivera@university.edu",
            "password": "password123",
        },
    }

