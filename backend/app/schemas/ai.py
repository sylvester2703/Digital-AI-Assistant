from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ToolCallLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result_summary: str


class AssistantQueryRequest(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = []


class AssistantQueryResponse(BaseModel):
    reply: str
    tool_calls: List[ToolCallLog] = []
    suggested_actions: List[Dict[str, Any]] = []
    grounded_entities: Dict[str, Any] = {}


class DailyDigestResponse(BaseModel):
    id: str
    digest_date: str
    greeting: str
    summary_text: str
    priorities: List[Dict[str, Any]] = []
    schedule: List[Dict[str, Any]] = []
    insights: List[str] = []
    created_at: datetime


class WeeklyReportResponse(BaseModel):
    id: str
    week_start_date: str
    week_end_date: str
    metrics: Dict[str, Any]
    recommendations: List[str]
    learning_focus: List[str]
    created_at: datetime


class InterviewPrepResponse(BaseModel):
    id: str
    interview_id: str
    company_overview: str
    role_summary: str
    top_skills: List[str]
    technical_questions: List[Dict[str, str]]
    behavioral_questions: List[Dict[str, str]]
    sql_questions: List[Dict[str, str]]
    python_questions: List[Dict[str, str]]
    questions_to_ask: List[str]
    preparation_checklist: List[str]
