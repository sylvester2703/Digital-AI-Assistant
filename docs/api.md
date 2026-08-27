# API Reference — Personal AI Student & Career Assistant

Base URL: `http://localhost:8000/api/v1`

## 1. Authentication & Profile
- `POST /auth/register` — Register a new student user.
- `POST /auth/login` — Sign in and obtain JWT access token.
- `POST /auth/logout` — Revoke session cookie.
- `GET /auth/me` — Return current authenticated user profile.
- `GET /profile` — Return student profile with skills and target preferences.
- `PUT /profile` — Update career preferences and education details.
- `POST /profile/skills` — Add technical skill with proficiency level.
- `DELETE /profile/skills/{id}` — Delete user skill.

## 2. Tasks & Productivity Planner
- `GET /tasks` — List tasks sorted by deterministic priority score (`?view=today|upcoming|overdue|completed`).
- `POST /tasks` — Create task with automatic priority scoring.
- `PATCH /tasks/{id}` — Update task status or due date.
- `DELETE /tasks/{id}` — Delete task.

## 3. Calendar & Conflict Center
- `GET /calendar` — Return all events with conflict annotations.
- `POST /calendar` — Create calendar event with automatic overlap checking.
- `PATCH /calendar/{id}` — Update event.
- `DELETE /calendar/{id}` — Delete event.

## 4. Inbox & Email Intelligence
- `GET /emails` — Return parsed emails (`?category=...&only_actionable=true`).
- `GET /emails/{id}` — Return email detail with extracted facts.
- `POST /emails/facts/{id}/convert-to-task` — Convert extracted fact to a planner task.

## 5. Academics & Coursework
- `GET /courses` — List enrolled courses.
- `GET /assignments` — List course assignments and submission status.
- `POST /assignments` — Create coursework assignment.
- `PATCH /assignments/{id}` — Update assignment submission status.
- `GET /courses/announcements` — List instructor announcements.

## 6. Jobs & Applications Pipeline
- `GET /jobs` — Query job listings with multi-factor match calculation (`?query=...&role=...&min_match=...`).
- `GET /applications` — Return application lifecycle pipeline.
- `POST /applications` — Add job application to pipeline.
- `PATCH /applications/{id}` — Update application status.
- `GET /applications/follow-ups` — List recommended recruiter follow-ups.
- `POST /applications/follow-ups/{id}/action` — Mark follow-up sent or snoozed.

## 7. Interviews & AI Prep
- `GET /interviews` — List scheduled interview rounds.
- `GET /interviews/{id}/prep` — Generate grounded, role-tailored AI prep kit.

## 8. AI Assistant Studio
- `POST /assistant/query` — Execute grounded assistant query with deterministic tool calls.

## 9. Analytics & Seed
- `GET /analytics/overview` — Dashboard summary metrics.
- `GET /analytics/trends` — Academic completion, career funnel, and skill gap metrics.
- `POST /seed/demo-data` — Populate demo scenarios for Alex Rivera.
