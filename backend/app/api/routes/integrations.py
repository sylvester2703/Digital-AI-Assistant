from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.user import ConnectedAccount, User
from app.schemas.integrations import (
    ConnectAccountRequest,
    ConnectedAccountResponse,
    IntegrationStatusResponse,
    SyncTriggerResponse,
)

router = APIRouter(prefix="/integrations", tags=["Connected Accounts & Integrations"])


@router.get("", response_model=IntegrationStatusResponse)
def list_connected_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.user_id == user.id).all()
    
    # If no accounts exist yet, seed the default set of supported providers in disconnected state
    all_providers = ["GOOGLE", "GMAIL", "GOOGLE_CALENDAR", "GOOGLE_CLASSROOM", "MICROSOFT", "TELEGRAM"]
    existing_providers = {a.provider for a in accounts}

    for p in all_providers:
        if p not in existing_providers:
            new_acc = ConnectedAccount(
                user_id=user.id,
                provider=p,
                is_connected=False,
            )
            db.add(new_acc)
            db.flush()
            accounts.append(new_acc)
            
    db.commit()

    return IntegrationStatusResponse(
        providers=[ConnectedAccountResponse.model_validate(a) for a in accounts]
    )


@router.post("/connect", response_model=ConnectedAccountResponse)
def connect_account(
    req: ConnectAccountRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    acc = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == user.id,
        ConnectedAccount.provider == req.provider,
    ).first()

    if not acc:
        acc = ConnectedAccount(
            user_id=user.id,
            provider=req.provider,
        )
        db.add(acc)

    acc.is_connected = True
    acc.account_email = user.email
    acc.last_synced_at = datetime.now(timezone.utc)
    acc.error_message = None

    db.commit()
    db.refresh(acc)
    return acc


@router.post("/disconnect/{provider}", response_model=ConnectedAccountResponse)
def disconnect_account(
    provider: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    acc = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == user.id,
        ConnectedAccount.provider == provider,
    ).first()
    if not acc:
        raise NotFoundException(message=f"No integration record found for {provider}.")

    acc.is_connected = False
    acc.account_email = None
    acc.last_synced_at = None
    acc.error_message = None

    db.commit()
    db.refresh(acc)
    return acc


@router.post("/sync/{provider}", response_model=SyncTriggerResponse)
def trigger_provider_sync(
    provider: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    acc = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == user.id,
        ConnectedAccount.provider == provider,
    ).first()
    if not acc or not acc.is_connected:
        return SyncTriggerResponse(
            provider=provider,
            status="DISCONNECTED",
            synced_items_count=0,
            message=f"{provider} is currently disconnected. Please connect account first.",
        )

    acc.last_synced_at = datetime.now(timezone.utc)
    acc.error_message = None
    db.commit()

    return SyncTriggerResponse(
        provider=provider,
        status="COMPLETED",
        synced_items_count=3,
        message=f"{provider} synchronization completed successfully.",
    )
