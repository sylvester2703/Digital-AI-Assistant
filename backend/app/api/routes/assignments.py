from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.models.academic import Assignment, Course
from app.models.task import Task
from app.models.user import User
from app.schemas.academic import AssignmentCreate, AssignmentResponse, AssignmentUpdate
from app.services.priority_engine import calculate_task_priority

router = APIRouter(prefix="/assignments", tags=["Academics"])


@router.get("", response_model=List[AssignmentResponse])
def list_assignments(
    course_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Assignment, Course).join(Course, Assignment.course_id == Course.id)\
        .filter(Assignment.user_id == user.id)

    if course_id:
        query = query.filter(Assignment.course_id == course_id)
    if status_filter:
        query = query.filter(Assignment.submission_status == status_filter)

    items = query.order_by(Assignment.due_at).all()
    results = []
    for a, c in items:
        results.append(AssignmentResponse(
            id=a.id,
            course_id=a.course_id,
            user_id=a.user_id,
            title=a.title,
            description=a.description,
            due_at=a.due_at,
            max_points=a.max_points,
            submission_status=a.submission_status,
            priority=a.priority,
            classroom_assignment_id=a.classroom_assignment_id,
            course_code=c.code,
            course_title=c.title,
            created_at=a.created_at,
        ))
    return results


@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    req: AssignmentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == req.course_id, Course.user_id == user.id).first()
    if not course:
        raise NotFoundException(message="Course not found.")

    assignment = Assignment(
        course_id=course.id,
        user_id=user.id,
        title=req.title,
        description=req.description,
        due_at=req.due_at,
        max_points=req.max_points,
        priority=req.priority,
    )
    db.add(assignment)
    db.flush()

    # Automatically synchronize into planner tasks
    p_label, score = calculate_task_priority(req.due_at, "ASSIGNMENT", req.priority)
    task = Task(
        user_id=user.id,
        title=f"[{course.code}] {req.title}",
        description=req.description,
        priority=p_label,
        calculated_score=score,
        status="TODO",
        due_at=req.due_at,
        source_type="ASSIGNMENT",
        source_id=assignment.id,
    )
    db.add(task)
    db.commit()
    db.refresh(assignment)

    return AssignmentResponse(
        id=assignment.id,
        course_id=assignment.course_id,
        user_id=assignment.user_id,
        title=assignment.title,
        description=assignment.description,
        due_at=assignment.due_at,
        max_points=assignment.max_points,
        submission_status=assignment.submission_status,
        priority=assignment.priority,
        classroom_assignment_id=assignment.classroom_assignment_id,
        course_code=course.code,
        course_title=course.title,
        created_at=assignment.created_at,
    )


@router.patch("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: str,
    req: AssignmentUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.user_id == user.id,
    ).first()
    if not assignment:
        raise NotFoundException(message="Assignment not found.")

    update_data = req.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(assignment, k, v)

    db.commit()
    db.refresh(assignment)

    course = db.query(Course).filter(Course.id == assignment.course_id).first()
    return AssignmentResponse(
        id=assignment.id,
        course_id=assignment.course_id,
        user_id=assignment.user_id,
        title=assignment.title,
        description=assignment.description,
        due_at=assignment.due_at,
        max_points=assignment.max_points,
        submission_status=assignment.submission_status,
        priority=assignment.priority,
        classroom_assignment_id=assignment.classroom_assignment_id,
        course_code=course.code if course else "",
        course_title=course.title if course else "",
        created_at=assignment.created_at,
    )
