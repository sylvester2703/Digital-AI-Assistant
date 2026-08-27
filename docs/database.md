# Database Schema Reference — Personal AI Student & Career Assistant

## Relational Entities

### 1. Identity & Profiles
- `users`: User authentication, email, password hash, role, timezone, active status.
- `profiles`: Education, branch, graduation year, target roles, preferred locations, remote preference, expected salary.
- `user_skills`: Normalized user technical skills with proficiency levels (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`).
- `connected_accounts`: OAuth integration states (`GOOGLE`, `GMAIL`, `GOOGLE_CALENDAR`, `GOOGLE_CLASSROOM`, `TELEGRAM`).

### 2. Academics
- `courses`: Enrolled courses, course code, title, faculty instructor, semester term, color accent, Google Classroom link.
- `assignments`: Course assignments, due dates, submission status (`PENDING`, `SUBMITTED`, `GRADED`, `LATE`), maximum points.
- `announcements`: Course announcements posted by instructors.

### 3. Productivity & Calendar
- `tasks`: Daily planner tasks, calculated priority score, due dates, duration, source type (`MANUAL`, `EMAIL`, `CLASSROOM`, `ASSIGNMENT`, `INTERVIEW`, `AI_SUGGESTION`), tags.
- `calendar_events`: Scheduled classes, exams, interviews, meetings, with conflict flag and conflict notes.

### 4. Communications & Email Intelligence
- `email_messages`: Parsed emails, subject, body, sender, category (`INTERVIEW`, `JOB_OPPORTUNITY`, `ASSIGNMENT`, `EXAM`, etc.), actionable flag.
- `extracted_facts`: Structured entities parsed from emails with confidence score, fact nature (`FACT`, `INFERENCE`, `RECOMMENDATION`), and converted task link.

### 5. Career & Hiring Pipeline
- `companies`: Company profiles and industry.
- `jobs`: Sourced job postings, location, work mode, employment type, salary range, required skills.
- `job_skills`: Normalized job competencies.
- `job_applications`: Application lifecycle pipeline (`SAVED`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`).
- `interviews`: Scheduled interview rounds, meeting link, interviewer info, conflict status.
- `follow_ups`: Recommended recruiter follow-up dates and auto-generated polite inquiry templates.
- `interview_preps`: Pre-compiled structured preparation kits (overview, technical questions, live SQL/Python tasks, questions to ask interviewer, 24-hr checklist).

### 6. Resumes & Audits
- `resumes`: Stored resume copies, primary flag.
- `resume_versions`: Resume text versions with extracted keywords.
- `audit_logs`: User security and action audit logs.
