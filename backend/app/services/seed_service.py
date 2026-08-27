import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.academic import Announcement, Assignment, Course
from app.models.application import FollowUp, Interview, JobApplication
from app.models.calendar_event import CalendarEvent
from app.models.career import Company, Job, JobSkill, Skill, UserSkill
from app.models.email import EmailMessage, ExtractedFact
from app.models.notification import Notification, NotificationPreference
from app.models.resume import Resume, ResumeVersion
from app.models.task import Task
from app.models.user import ConnectedAccount, Profile, User
from app.services.conflict_detector import evaluate_event_conflicts
from app.services.email_intelligence import categorize_and_extract_email
from app.services.job_matcher import refresh_user_job_matches
from app.services.priority_engine import calculate_task_priority


def seed_demo_environment(db: Session) -> User:
    """
    Creates a full-featured realistic demo user and comprehensive database records
    covering academics, calendar, emails, jobs, applications, interviews, and tasks.
    """
    demo_email = "alex.rivera@university.edu"
    existing_user = db.query(User).filter(User.email == demo_email).first()
    if existing_user:
        return existing_user

    now = datetime.now(timezone.utc)

    # 1. Create User
    user = User(
        email=demo_email,
        hashed_password=hash_password("password123"),
        full_name="Alex Rivera",
        role="STUDENT",
        timezone="Asia/Kolkata",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Profile
    profile = Profile(
        user_id=user.id,
        headline="Aspiring Data Analyst & AI Engineer | Final Year CS Student",
        bio="Passionate about turning complex datasets into actionable business intelligence. Experienced with SQL, Python, Power BI, and modern ML pipelines.",
        education="National Institute of Technology",
        degree="Bachelor of Technology",
        branch="Computer Science & Engineering",
        grad_year=2026,
        target_roles=json.dumps(["Data Analyst", "Business Analyst", "Data Science Intern", "Python Developer", "AI/ML Intern"]),
        target_locations=json.dumps(["Pune", "Bangalore", "Hyderabad", "Remote"]),
        remote_pref="ANY",
        employment_pref="INTERNSHIP_OR_FULLTIME",
        expected_salary="₹8,00,000 - ₹12,00,000",
        expected_stipend="₹35,000 / month",
        portfolio_url="https://alexrivera-analytics.dev",
        github_url="https://github.com/alexrivera-data",
        linkedin_url="https://linkedin.com/in/alexrivera-analyst",
        certifications=json.dumps(["Google Data Analytics Professional", "Microsoft Power BI Data Analyst Associate (PL-300)", "AWS Certified Cloud Practitioner"]),
    )
    db.add(profile)

    # 3. User Skills
    user_skills_data = [
        ("Python", "ADVANCED", 2.5),
        ("SQL", "ADVANCED", 3.0),
        ("Power BI", "INTERMEDIATE", 1.5),
        ("Excel", "ADVANCED", 3.0),
        ("Pandas", "ADVANCED", 2.0),
        ("NumPy", "INTERMEDIATE", 2.0),
        ("Machine Learning", "INTERMEDIATE", 1.5),
        ("Tableau", "INTERMEDIATE", 1.0),
        ("Git", "INTERMEDIATE", 2.0),
        ("Statistics", "ADVANCED", 2.5),
    ]
    for name, prof, exp in user_skills_data:
        db.add(UserSkill(user_id=user.id, skill_name=name, proficiency=prof, years_experience=exp))

    # 4. Connected Accounts
    providers = [
        ("GOOGLE", "alex.rivera@university.edu", True, now - timedelta(minutes=15), "openid email profile"),
        ("GMAIL", "alex.rivera@university.edu", True, now - timedelta(minutes=15), "https://www.googleapis.com/auth/gmail.readonly"),
        ("GOOGLE_CALENDAR", "alex.rivera@university.edu", True, now - timedelta(minutes=15), "https://www.googleapis.com/auth/calendar.readonly"),
        ("GOOGLE_CLASSROOM", "alex.rivera@university.edu", True, now - timedelta(minutes=30), "https://www.googleapis.com/auth/classroom.courses.readonly"),
        ("MICROSOFT", None, False, None, None),
        ("TELEGRAM", None, False, None, None),
    ]
    for prov, email, is_conn, synced, scopes in providers:
        db.add(ConnectedAccount(
            user_id=user.id,
            provider=prov,
            account_email=email,
            is_connected=is_conn,
            last_synced_at=synced,
            scopes=scopes,
        ))

    # 5. Courses & Assignments
    courses_data = [
        ("CS401", "Machine Learning & Data Mining", "Dr. Sarah Chen", "Fall 2026", "#6366f1"),
        ("CS302", "Database Management Systems", "Prof. Robert Miller", "Fall 2026", "#0ea5e9"),
        ("BUS201", "Business Analytics & BI", "Dr. Anita Desai", "Fall 2026", "#10b981"),
        ("STAT205", "Applied Probability & Statistics", "Dr. Vikram Patel", "Fall 2026", "#f59e0b"),
    ]
    created_courses = []
    for code, title, instr, term, color in courses_data:
        c = Course(user_id=user.id, code=code, title=title, instructor=instr, term=term, color=color)
        db.add(c)
        db.flush()
        created_courses.append(c)

    # Assignments
    assignments_data = [
        (created_courses[0].id, "ML Assignment 3: Random Forests & XGBoost on Churn Dataset", "Train and evaluate ensemble models. Submit Jupyter notebook with ROC curves and feature importance charts.", now + timedelta(days=2, hours=4), 100.0, "PENDING", "HIGH"),
        (created_courses[1].id, "DBMS Lab 5: Advanced SQL Window Functions & Indexing", "Write queries utilizing PARTITION BY and analyze query execution plans with EXPLAIN ANALYZE.", now + timedelta(days=4), 50.0, "PENDING", "MEDIUM"),
        (created_courses[2].id, "Case Study: Power BI Dashboard for Retail KPI Monitoring", "Design an executive dashboard tracking monthly revenue, gross margin, and inventory turnover.", now + timedelta(days=6), 75.0, "PENDING", "MEDIUM"),
        (created_courses[3].id, "Problem Set 4: Hypothesis Testing & ANOVA", "Complete exercises on two-sample t-tests and p-value interpretations.", now - timedelta(days=1), 40.0, "SUBMITTED", "LOW"),
    ]
    for c_id, title, desc, due, pts, status, prio in assignments_data:
        db.add(Assignment(
            course_id=c_id,
            user_id=user.id,
            title=title,
            description=desc,
            due_at=due,
            max_points=pts,
            submission_status=status,
            priority=prio,
        ))

    # Course Announcements
    db.add(Announcement(
        course_id=created_courses[0].id,
        user_id=user.id,
        title="Midterm Exam Date & Study Guide Released",
        content="The Machine Learning midterm exam will take place on Friday. Review Chapters 1-5 and homework solutions.",
        posted_at=now - timedelta(days=1),
        author_name="Dr. Sarah Chen",
    ))

    # 6. Canonical Jobs
    jobs_data = [
        (
            "Apex Analytics Solutions",
            "Junior Data Analyst",
            "We are seeking a Junior Data Analyst to join our decision intelligence team. You will query large databases using SQL, build automated reporting in Power BI, and partner with product managers to uncover customer trends.",
            "Pune", "HYBRID", "FULL_TIME", "ENTRY_LEVEL",
            600000.0, 850000.0, "INR", "DIRECT",
            ["SQL", "Python", "Power BI", "Excel", "Data Analysis", "Statistics"]
        ),
        (
            "CloudScale AI Labs",
            "Data Science & Analytics Intern",
            "Exciting 6-month internship developing customer segmentation and predictive forecasting models. Strong background in Python, Pandas, and Scikit-Learn required.",
            "Bangalore", "REMOTE", "INTERNSHIP", "ENTRY_LEVEL",
            360000.0, 480000.0, "INR", "JOB_ALERT",
            ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "Git"]
        ),
        (
            "FinTech Horizon",
            "Business Intelligence Analyst",
            "Help design executive KPI dashboards and financial anomaly detection pipelines using SQL, Tableau, and data warehousing principles.",
            "Hyderabad", "ONSITE", "FULL_TIME", "ENTRY_LEVEL",
            700000.0, 950000.0, "INR", "DIRECT",
            ["SQL", "Tableau", "Power BI", "Excel", "Data Visualization", "Business Intelligence"]
        ),
        (
            "Nexus Systems",
            "Python Backend & Data Developer",
            "Build high-throughput FastAPI microservices and automated ETL scripts. Experience with Python, relational databases, and REST APIs is essential.",
            "Remote", "REMOTE", "FULL_TIME", "ENTRY_LEVEL",
            800000.0, 1100000.0, "INR", "DIRECT",
            ["Python", "SQL", "FastAPI", "PostgreSQL", "Git", "Docker"]
        ),
    ]

    created_jobs = []
    for comp, title, desc, loc, wmode, emptype, explevel, min_s, max_s, curr, src, skills_list in jobs_data:
        j = Job(
            company_name=comp,
            title=title,
            description=desc,
            location=loc,
            work_mode=wmode,
            employment_type=emptype,
            experience_level=explevel,
            min_salary=min_s,
            max_salary=max_s,
            salary_currency=curr,
            source_name=src,
            posted_at=now - timedelta(days=2),
            is_active=True,
        )
        db.add(j)
        db.flush()
        for sk in skills_list:
            db.add(JobSkill(job_id=j.id, skill_name=sk, is_required=True))
        created_jobs.append(j)

    # 7. Job Applications & Interviews
    app1 = JobApplication(
        user_id=user.id,
        job_id=created_jobs[0].id,
        company_name=created_jobs[0].company_name,
        role_title=created_jobs[0].title,
        platform="DIRECT",
        status="INTERVIEW",
        applied_at=now - timedelta(days=8),
        recruiter_name="Pooja Sharma",
        recruiter_email="pooja.sharma@apexanalytics.com",
        location="Pune",
        notes="First round screening went very well. Technical round scheduled with Lead Data Analyst.",
        follow_up_date=now + timedelta(days=3),
    )
    db.add(app1)
    db.flush()

    # Scheduled Interview (Today afternoon)
    interview_start = now.replace(hour=14, minute=0, second=0, microsecond=0)
    interview_end = interview_start + timedelta(minutes=45)
    iv = Interview(
        user_id=user.id,
        application_id=app1.id,
        company_name=app1.company_name,
        role_title=app1.role_title,
        round_name="Technical Round 1: SQL & Problem Solving",
        round_number=1,
        start_at=interview_start,
        end_at=interview_end,
        interview_type="TECHNICAL",
        meeting_link="https://meet.google.com/abc-xyz-data",
        interviewer_info="Rohan Verma (Lead Analytics Engineer)",
        status="SCHEDULED",
        prep_progress_percent=70,
        conflicts_detected=True,  # Will flag conflict with overlapping CS401 Lecture
        notes="Focus on SQL window functions, joins, and data modeling scenario.",
    )
    db.add(iv)

    # Follow-up recommendation for another application
    app2 = JobApplication(
        user_id=user.id,
        job_id=created_jobs[1].id,
        company_name=created_jobs[1].company_name,
        role_title=created_jobs[1].title,
        platform="CAREER_PORTAL",
        status="APPLIED",
        applied_at=now - timedelta(days=10),
        recruiter_name="Ananya Roy",
        recruiter_email="talent@cloudscale.ai",
        location="Bangalore",
        notes="Submitted resume tailored for ML & analytics internship.",
        follow_up_date=now + timedelta(days=1),
    )
    db.add(app2)
    db.flush()

    db.add(FollowUp(
        application_id=app2.id,
        user_id=user.id,
        due_date=now + timedelta(days=1),
        suggested_message="Dear Ananya, I hope you are well. I wanted to follow up on my application for the Data Science Intern position submitted 10 days ago. I remain very enthusiastic about CloudScale AI Labs.",
        status="PENDING",
    ))

    # 8. Calendar Events (including intentional overlap to demonstrate Conflict Detection)
    # Event 1: CS401 Machine Learning Lecture (13:30 - 15:00) -> Overlaps with 14:00 Interview!
    cal_start1 = now.replace(hour=13, minute=30, second=0, microsecond=0)
    cal_end1 = now.replace(hour=15, minute=0, second=0, microsecond=0)
    db.add(CalendarEvent(
        user_id=user.id,
        title="CS401: Machine Learning & Data Mining Lecture",
        description="Ensemble methods, Random Forests, and Gradient Boosting algorithms.",
        event_type="CLASS",
        start_at=cal_start1,
        end_at=cal_end1,
        location="Room 304, Tech Wing",
        has_conflict=True,
        conflict_notes=f"Schedule Conflict: Overlaps with Technical Interview for Apex Analytics ({interview_start.strftime('%H:%M')} - {interview_end.strftime('%H:%M')})",
    ))

    # Event 2: DBMS Lab (10:00 - 11:30)
    cal_start2 = now.replace(hour=10, minute=0, second=0, microsecond=0)
    cal_end2 = now.replace(hour=11, minute=30, second=0, microsecond=0)
    db.add(CalendarEvent(
        user_id=user.id,
        title="CS302: DBMS Hands-on Lab",
        description="Query performance tuning, indexing strategies, and EXPLAIN plans.",
        event_type="CLASS",
        start_at=cal_start2,
        end_at=cal_end2,
        location="Computer Lab 2",
        has_conflict=False,
    ))

    # Event 3: Project Group Meeting (Tomorrow 16:00 - 17:00)
    cal_start3 = (now + timedelta(days=1)).replace(hour=16, minute=0, second=0, microsecond=0)
    cal_end3 = cal_start3 + timedelta(hours=1)
    db.add(CalendarEvent(
        user_id=user.id,
        title="Capstone Project Sprint Review",
        description="Review pipeline architecture and dataset preprocessing steps.",
        event_type="MEETING",
        start_at=cal_start3,
        end_at=cal_end3,
        meeting_url="https://meet.google.com/capstone-sync",
        has_conflict=False,
    ))

    # 9. Tasks in Planner (with deterministic priority scores)
    tasks_data = [
        ("Prepare for Apex Analytics Technical Interview (SQL & Window Functions)", "Review STAR stories, complex aggregation questions, and test webcam.", now.replace(hour=13, minute=0, second=0, microsecond=0), "CRITICAL", "INTERVIEW", "TODO", 45),
        ("Complete ML Assignment 3: Random Forests & XGBoost", "Train models on churn dataset and write up performance metrics report.", now + timedelta(days=2), "HIGH", "ASSIGNMENT", "IN_PROGRESS", 120),
        ("Send polite follow-up email to CloudScale AI Labs", "Follow up on Data Science Intern application submitted 10 days ago.", now + timedelta(days=1), "HIGH", "EMAIL", "TODO", 15),
        ("Update LinkedIn profile with Power BI PL-300 Certification", "Add credential ID and link to portfolio dashboard.", now + timedelta(days=4), "MEDIUM", "MANUAL", "TODO", 30),
        ("Review DBMS Lecture Slides on Indexing & Query Plans", "Prepare for upcoming weekly quiz.", now + timedelta(days=3), "MEDIUM", "CLASSROOM", "TODO", 45),
    ]

    for title, desc, due, user_prio, src, status, est_dur in tasks_data:
        p_label, score = calculate_task_priority(due, src, user_prio)
        db.add(Task(
            user_id=user.id,
            title=title,
            description=desc,
            due_at=due,
            priority=p_label,
            calculated_score=score,
            status=status,
            source_type=src,
            estimated_duration_minutes=est_dur,
        ))

    # 10. Inbox Emails with Extracted Facts
    emails_data = [
        (
            "msg_apex_001",
            "Pooja Sharma",
            "pooja.sharma@apexanalytics.com",
            "Invitation: Technical Interview Round 1 — Junior Data Analyst",
            "Hi Alex, We were very impressed with your background and would like to invite you to Technical Round 1 on Google Meet.",
            "Hi Alex,\n\nWe were very impressed with your background and would like to invite you to Technical Round 1.\n\nTime: Today at 2:00 PM IST\nMeeting Link: https://meet.google.com/abc-xyz-data\nInterviewer: Rohan Verma (Lead Analytics Engineer)\n\nPlease confirm your availability.\n\nBest regards,\nPooja Sharma\nApex Analytics Solutions",
            now - timedelta(hours=3),
        ),
        (
            "msg_cloudscale_002",
            "Hiring Team",
            "talent@cloudscale.ai",
            "Application Received: Data Science & Analytics Intern",
            "Thank you for applying to CloudScale AI Labs. We are reviewing applications and will update you shortly.",
            "Dear Alex,\n\nThank you for applying for the Data Science & Analytics Intern position at CloudScale AI Labs. Our engineering team is currently reviewing your profile.",
            now - timedelta(days=10),
        ),
        (
            "msg_prof_003",
            "Dr. Sarah Chen",
            "schen@university.edu",
            "CS401: Assignment 3 Guidelines & Dataset Link",
            "Please find attached the customer churn dataset. Submissions are due this Friday by 5:00 PM via Classroom.",
            "Dear Students,\n\nPlease find attached the customer churn dataset for Assignment 3. Please submit your Jupyter notebook by Friday 5:00 PM.\n\nBest,\nDr. Chen",
            now - timedelta(days=1, hours=2),
        ),
    ]

    for p_id, s_name, s_email, subj, snip, body, r_time in emails_data:
        analysis = categorize_and_extract_email(subj, snip, body, s_email, s_name)
        em = EmailMessage(
            user_id=user.id,
            provider_id=p_id,
            sender_name=s_name,
            sender_email=s_email,
            recipient_email=user.email,
            subject=subj,
            snippet=snip,
            body_text=body,
            received_at=r_time,
            category=analysis["category"],
            priority=analysis["priority"],
            summary=analysis["summary"],
            is_actionable=analysis["is_actionable"],
            is_read=False,
        )
        db.add(em)
        db.flush()
        
        for fact in analysis["extracted_facts"]:
            db.add(ExtractedFact(
                email_id=em.id,
                user_id=user.id,
                fact_type=fact["fact_type"],
                fact_nature=fact["fact_nature"],
                value=fact["value"],
                confidence=fact["confidence"],
                evidence=fact["evidence"],
            ))

    # 11. Notifications & Preferences
    db.add(NotificationPreference(
        user_id=user.id,
        email_enabled=True,
        telegram_enabled=False,
        push_enabled=True,
        critical_instant=True,
        important_digest=True,
        digest_frequency="DAILY",
    ))

    db.add(Notification(
        user_id=user.id,
        title="Schedule Conflict Alert",
        message="Your Technical Interview at 2:00 PM overlaps with CS401 Machine Learning Lecture (1:30 PM - 3:00 PM).",
        category="CRITICAL",
        link_url="/calendar",
        sent_at=now,
    ))

    db.add(Notification(
        user_id=user.id,
        title="High Match Job Discovered",
        message="Apex Analytics Solutions posted 'Junior Data Analyst' (92% Match with your skills).",
        category="IMPORTANT",
        link_url="/jobs",
        sent_at=now - timedelta(hours=5),
    ))

    # 12. Resume Record
    db.add(Resume(
        user_id=user.id,
        title="Data Analyst & Python Developer Resume",
        target_role="Data Analyst",
        is_default=True,
        file_name="Alex_Rivera_Data_Analyst_2026.pdf",
        file_path="./uploads/demo_resume.pdf",
        file_size_bytes=104857,
        extracted_text="Alex Rivera | alex.rivera@university.edu | Education: B.Tech in CSE (2026). Skills: Python, SQL, Power BI, Pandas, NumPy, Machine Learning, Tableau, Git. Projects: Customer Churn Prediction with XGBoost, Retail KPI Executive Dashboard in Power BI, Automated ETL pipeline with FastAPI & PostgreSQL.",
    ))

    db.commit()

    # Refresh deterministic job match calculations for the user
    refresh_user_job_matches(db, user.id)

    return user
