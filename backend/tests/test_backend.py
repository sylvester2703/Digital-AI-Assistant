import os
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # Ensure all models are loaded
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.services.conflict_detector import check_time_overlap
from app.services.email_intelligence import categorize_and_extract_email
from app.services.priority_engine import calculate_task_priority
from app.services.seed_service import seed_demo_environment

# Setup in-memory SQLite with StaticPool so all connections share the same memory DB
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Pre-seed the test database
with TestingSessionLocal() as session:
    seed_demo_environment(session)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_priority_engine():
    now = datetime.now(timezone.utc)
    
    # 1. Overdue task -> Critical/High
    p_label, score = calculate_task_priority(now - timedelta(hours=2), "MANUAL")
    assert p_label in ["CRITICAL", "HIGH"]
    assert score >= 70.0

    # 2. Upcoming exam -> High/Critical
    p_label, score = calculate_task_priority(now + timedelta(hours=10), "EXAM")
    assert p_label in ["CRITICAL", "HIGH"]

    # 3. Far deadline with Low priority -> Low
    p_label, score = calculate_task_priority(now + timedelta(days=20), "MANUAL", "LOW")
    assert p_label == "LOW"
    assert score < 40.0


def test_conflict_detector():
    start1 = datetime(2026, 9, 1, 10, 0)
    end1 = datetime(2026, 9, 1, 11, 30)

    start2 = datetime(2026, 9, 1, 11, 0)
    end2 = datetime(2026, 9, 1, 12, 0)

    start3 = datetime(2026, 9, 1, 12, 0)
    end3 = datetime(2026, 9, 1, 13, 0)

    # 1 and 2 overlap (11:00 - 11:30)
    assert check_time_overlap(start1, end1, start2, end2) is True
    # 1 and 3 do not overlap
    assert check_time_overlap(start1, end1, start3, end3) is False


def test_email_intelligence_extraction():
    subj = "Invitation: Technical Interview Round 1 — Data Analyst"
    snippet = "Please join via Google Meet https://meet.google.com/abc-xyz-data"
    body = "Hi, we are pleased to invite you to interview today."
    
    res = categorize_and_extract_email(subj, snippet, body, "recruiter@company.com", "Recruiter")
    assert res["category"] == "INTERVIEW"
    assert res["priority"] == "CRITICAL"
    assert res["is_actionable"] is True
    assert len(res["extracted_facts"]) >= 1


def test_auth_registration_and_login():
    reg_payload = {
        "email": "test.engineer@domain.com",
        "password": "securepassword123",
        "full_name": "Test Engineer",
        "timezone": "UTC"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "test.engineer@domain.com"

    # Login
    login_payload = {
        "email": "test.engineer@domain.com",
        "password": "securepassword123"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # Verify protected /me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["full_name"] == "Test Engineer"


def test_task_creation_and_completion():
    # Login as demo user
    login_res = client.post("/api/v1/auth/login", json={"email": "alex.rivera@university.edu", "password": "password123"})
    assert login_res.status_code == 200

    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create task
    task_payload = {
        "title": "Unit Test Task",
        "description": "Created during pytest execution",
        "priority": "HIGH",
        "status": "TODO"
    }
    res = client.post("/api/v1/tasks", json=task_payload, headers=headers)
    assert res.status_code == 201
    t_data = res.json()
    t_id = t_data["id"]
    assert t_data["title"] == "Unit Test Task"
    assert t_data["calculated_score"] > 0

    # Mark complete
    res_up = client.patch(f"/api/v1/tasks/{t_id}", json={"status": "COMPLETED"}, headers=headers)
    assert res_up.status_code == 200
    assert res_up.json()["status"] == "COMPLETED"
    assert res_up.json()["completed_at"] is not None


def test_ai_assistant_grounded_query():
    login_res = client.post("/api/v1/auth/login", json={"email": "alex.rivera@university.edu", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/v1/assistant/query", json={"query": "What should I focus on today?"}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["reply"]) > 0
    assert len(data["tool_calls"]) > 0
