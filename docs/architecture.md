# System Architecture — Personal AI Student & Career Assistant

## 1. Architectural Overview

The **Personal AI Student & Career Assistant** (Apex Assistant) is a centralized, privacy-first productivity and career intelligence system designed for students and early-career job seekers.

```mermaid
graph TD
    A[Next.js 14 App Router UI] -->|HTTP / REST + Bearer JWT| B[FastAPI Backend Engine]
    B --> C[SQLAlchemy 2.x ORM]
    C --> D[(SQLite / PostgreSQL Database)]
    
    subgraph Deterministic Engines
        E1[Priority Engine]
        E2[Conflict Detector]
        E3[Job Matcher]
        E4[Email Intelligence]
        E5[Resume Analyzer]
    end

    subgraph Grounded AI Layer
        F1[AI Tools Registry]
        F2[Context Synthesizer]
        F3[Interview Prep Kit Generator]
    end

    B --> Deterministic Engines
    B --> Grounded AI Layer
```

---

## 2. Core Deterministic Services

### 2.1 Multi-Factor Priority Engine (`priority_engine.py`)
Computes an explainable score between 0 and 100 based on:
- **Deadline Proximity:**
  - Overdue: `+50 pts`
  - Due within 24 hours: `+40 pts`
  - Due within 3 days: `+25 pts`
  - Due within 7 days: `+10 pts`
- **Source Type Weight:**
  - Recruiter Interview: `+30 pts`
  - Exam: `+28 pts`
  - Coursework Assignment: `+20 pts`
  - Actionable Email: `+15 pts`
- **Explicit Base Priority:**
  - Critical: `+20 pts` | High: `+15 pts` | Medium: `+10 pts` | Low: `+5 pts`

### 2.2 Strict Conflict Detector (`conflict_detector.py`)
Applies the strict interval overlap formula:
$$\text{event}_A.\text{start} < \text{event}_B.\text{end} \quad \text{AND} \quad \text{event}_A.\text{end} > \text{event}_B.\text{start}$$
Detects overlaps across calendar events, lectures, assignment deadlines, and recruiter interview slots.

### 2.3 Multi-Factor Job Matcher (`job_matcher.py`)
Evaluates:
1. **Skill Overlap (50%):** Jaccard / inclusion overlap of user skills vs required job competencies.
2. **Target Role Alignment (20%):** Fuzzy substring role matching.
3. **Location & Work Mode (15%):** Remote preference vs job policy.
4. **Experience Level (10%):** Entry-level / Internship fit.
5. **Listing Freshness (5%):** Decay score based on posted date.

### 2.4 Grounded AI Assistant (`ai_service.py` & `ai_tools.py`)
- Executes authorized deterministic query tools (`get_today_schedule`, `get_tasks`, `get_upcoming_interviews`, etc.).
- Never hallucinates fake dates or schedule items; synthesizes responses strictly from tool execution outputs.
- Returns executable UI actions (`NAVIGATE`, `QUERY`) to facilitate immediate user actions.

---

## 3. Technology Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query, Recharts.
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy 2.0, Pydantic v2, Alembic, Uvicorn.
- **Database:** SQLite with foreign keys enabled (default) or PostgreSQL.
