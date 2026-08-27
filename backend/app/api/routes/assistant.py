from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai import AssistantQueryRequest, AssistantQueryResponse, ToolCallLog
from app.services.ai_service import AIService

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


@router.post("/query", response_model=AssistantQueryResponse)
def execute_assistant_query(
    req: AssistantQueryRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = AIService.answer_query(db, user, req.query)
    
    return AssistantQueryResponse(
        reply=result["reply"],
        tool_calls=[ToolCallLog(**tc) for tc in result["tool_calls"]],
        suggested_actions=result["suggested_actions"],
        grounded_entities=result["grounded_entities"],
    )
