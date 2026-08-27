from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.notification import Notification, NotificationPreference
from app.models.user import User
from app.schemas.notification import NotificationPrefResponse, NotificationPrefUpdate, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def list_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()
    return notifs


@router.post("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id,
    ).first()
    if not notif:
        raise NotFoundException(message="Notification not found.")

    notif.is_read = True
    db.commit()
    return {"message": "Marked as read."}


@router.post("/read-all")
def mark_all_notifications_read(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}


@router.get("/preferences", response_model=NotificationPrefResponse)
def get_notification_preferences(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.patch("/preferences", response_model=NotificationPrefResponse)
def update_notification_preferences(
    req: NotificationPrefUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=user.id)
        db.add(pref)

    update_data = req.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(pref, k, v)

    db.commit()
    db.refresh(pref)
    return pref
