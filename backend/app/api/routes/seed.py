from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.seed_service import seed_demo_environment

router = APIRouter(prefix="/seed", tags=["Seed & Development"])


@router.post("/demo-data", status_code=status.HTTP_201_CREATED)
def trigger_seed_demo_data(db: Session = Depends(get_db)):
    user = seed_demo_environment(db)
    return {
        "success": True,
        "message": "Demo data populated successfully.",
        "demo_credentials": {
            "email": "alex.rivera@university.edu",
            "password": "password123",
        },
    }
