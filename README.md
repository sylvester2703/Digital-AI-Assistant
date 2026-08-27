# Personal AI Student & Career Assistant (Apex Assistant)

> **"Don't make the user search for important information. Bring the important information to the user."**

A centralized, privacy-first productivity and career intelligence platform designed for university students and early-career job seekers. Combines academics, task priority ranking, calendar conflict prevention, inbox intelligence, career discovery, application tracking, grounded AI interview preparation, and conversational assistance into a single unified SaaS operating system.

---

## Key Features

1. **Deterministic Multi-Factor Priority Engine (`0–100` score)**:
   - Evaluates deadline proximity, source type (Interviews, Exams, Coursework), and urgency.
2. **Schedule Conflict Center**:
   - Strict interval overlap detection across lectures, labs, and scheduled recruiter interviews with resolution warnings.
3. **Inbox & Email Intelligence**:
   - Extracts deadlines, meeting links, and recruiter action items with verified confidence levels. 1-click conversion to planner tasks.
4. **Career Opportunity Matching**:
   - Multi-factor compatibility scoring (skills, target role, work mode, experience level) with transparent match rationales and skill gap analysis.
5. **Job Application Pipeline Tracker**:
   - Interactive Kanban board (Saved -> Applied -> Assessment -> Interview -> Offer -> Rejected) with automated 7-day recruiter follow-up recommendations and pre-drafted templates.
6. **Interview Center & AI Prep Kit**:
   - Role-specific preparation kits with company background, technical focus areas, behavioral STAR questions, live SQL/Python coding scenarios, and a 24-hour checklist.
7. **Grounded AI Assistant Studio**:
   - Conversational assistant with direct tool execution across tasks, calendar, emails, and job database records. Zero hallucinated dates.
8. **Real Analytics & Trends**:
   - Interactive visual charts (Recharts) for academic workload completion rates, career conversion funnel, and market skill demands.

---

## Quick Start (Local Setup)

### 1. Backend (FastAPI + SQLAlchemy)

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run_server.py
```
Backend API will be live at `http://127.0.0.1:8000` (Swagger docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend (Next.js 14 App Router + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will be live at `http://localhost:3000`.

### 3. One-Click Demonstration

On the login screen (`http://localhost:3000/login`), click **"Launch Pre-Seeded Demo"**. This immediately logs you in as pre-seeded student **Alex Rivera** (`alex.rivera@university.edu`) with active courses, scheduled interviews, conflict alerts, and job matches.

---

## Running Test Suite

```bash
cd backend
pytest tests
```
*7/7 comprehensive unit and integration test suites covering priority scoring, conflict detection, job matching, resume analysis, email fact extraction, AI tools, and auth.*

---

## Docker Deployment

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## Documentation

- [Architecture & Design Decisions](file:///docs/architecture.md)
- [Database Schema Reference](file:///docs/database.md)
- [Integrations & OAuth Setup](file:///docs/integrations.md)
- [Complete API Reference](file:///docs/api.md)
