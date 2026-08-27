import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.priority_engine import calculate_task_priority

router = APIRouter(prefix="/tasks", tags=["Planner & Tasks"])


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    view: Optional[str] = Query(None),  # today, upcoming, overdue, completed
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Task).filter(Task.user_id == user.id)
    now = datetime.now(timezone.utc)

    if view == "today":
        start_of_day = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
        end_of_day = datetime(now.year, now.month, now.day, 23, 59, 59, tzinfo=timezone.utc)
        query = query.filter(Task.due_at >= start_of_day, Task.due_at <= end_of_day)
    elif view == "overdue":
        query = query.filter(Task.status != "COMPLETED", Task.due_at < now)
    elif view == "completed":
        query = query.filter(Task.status == "COMPLETED")
    elif view == "upcoming":
        query = query.filter(Task.status != "COMPLETED", Task.due_at >= now)

    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority_filter:
        query = query.filter(Task.priority == priority_filter)

    tasks = query.order_by(desc(Task.calculated_score), Task.due_at).all()
    
    results = []
    for t in tasks:
        tags = json.loads(t.tags) if t.tags else []
        t_dict = {
            "id": t.id,
            "user_id": t.user_id,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "calculated_score": t.calculated_score,
            "status": t.status,
            "due_at": t.due_at,
            "estimated_duration_minutes": t.estimated_duration_minutes,
            "completed_at": t.completed_at,
            "source_type": t.source_type,
            "source_id": t.source_id,
            "tags": tags,
            "created_at": t.created_at,
            "updated_at": t.updated_at,
        }
        results.append(TaskResponse(**t_dict))

    return results


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    req: TaskCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    p_label, score = calculate_task_priority(req.due_at, req.source_type, req.priority)

    task = Task(
        user_id=user.id,
        title=req.title,
        description=req.description,
        priority=p_label,
        calculated_score=score,
        status=req.status,
        due_at=req.due_at,
        estimated_duration_minutes=req.estimated_duration_minutes,
        source_type=req.source_type,
        source_id=req.source_id,
        tags=json.dumps(req.tags or []),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        calculated_score=task.calculated_score,
        status=task.status,
        due_at=task.due_at,
        estimated_duration_minutes=task.estimated_duration_minutes,
        completed_at=task.completed_at,
        source_type=task.source_type,
        source_id=task.source_id,
        tags=req.tags or [],
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    req: TaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    if not task:
        raise NotFoundException(message="Task not found.")

    update_data = req.model_dump(exclude_unset=True)

    if "status" in update_data:
        task.status = update_data["status"]
        if task.status == "COMPLETED":
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

    if "title" in update_data:
        task.title = update_data["title"]
    if "description" in update_data:
        task.description = update_data["description"]
    if "due_at" in update_data:
        task.due_at = update_data["due_at"]
    if "estimated_duration_minutes" in update_data:
        task.estimated_duration_minutes = update_data["estimated_duration_minutes"]
    if "tags" in update_data:
        task.tags = json.dumps(update_data["tags"])

    # Re-calculate priority score
    user_prio = update_data.get("priority", task.priority)
    p_label, score = calculate_task_priority(task.due_at, task.source_type, user_prio)
    task.priority = p_label
    task.calculated_score = score

    db.commit()
    db.refresh(task)

    tags = json.loads(task.tags) if task.tags else []
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        calculated_score=task.calculated_score,
        status=task.status,
        due_at=task.due_at,
        estimated_duration_minutes=task.estimated_duration_minutes,
        completed_at=task.completed_at,
        source_type=task.source_type,
        source_id=task.source_id,
        tags=tags,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    if not task:
        raise NotFoundException(message="Task not found.")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully."}
