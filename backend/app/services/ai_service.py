import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.models.ai import DailyDigest, InterviewPrep, WeeklyReport
from app.models.application import FollowUp, Interview, JobApplication
from app.models.career import Job, JobMatch
from app.models.task import Task
from app.models.user import User
from app.services.ai_tools import TOOL_REGISTRY


class AIService:
    @staticmethod
    def answer_query(db: Session, user: User, query: str) -> Dict[str, Any]:
        """
        Executes a grounded query by inspecting user intent, selecting appropriate backend tools,
        retrieving live database records, and synthesizing an accurate, grounded answer.
        """
        q_lower = query.lower()
        tool_calls = []
        grounded_data = {}
        suggested_actions = []

        # Intent detection & tool dispatch
        if any(w in q_lower for w in ["today", "morning", "focus", "schedule", "agenda", "what's important"]):
            schedule = TOOL_REGISTRY["get_today_schedule"](db, user.id)
            tasks = TOOL_REGISTRY["get_tasks"](db, user.id, status="TODO")
            interviews = TOOL_REGISTRY["get_upcoming_interviews"](db, user.id)
            
            tool_calls.append({"tool_name": "get_today_schedule", "arguments": {}, "result_summary": f"Found {schedule['events_count']} events today"})
            tool_calls.append({"tool_name": "get_tasks", "arguments": {"status": "TODO"}, "result_summary": f"Found {tasks['count']} pending tasks"})
            
            grounded_data["schedule"] = schedule
            grounded_data["tasks"] = tasks

            reply_lines = [
                f"### Daily Focus for {user.full_name.split()[0]}",
                "",
            ]
            if interviews["count"] > 0:
                iv = interviews["interviews"][0]
                reply_lines.append(f"🎯 **High Priority:** You have an upcoming interview with **{iv['company']}** ({iv['role']}) at **{iv['start_at']}**.")
            
            if tasks["count"] > 0:
                top_task = tasks["tasks"][0]
                reply_lines.append(f"📌 **Key Priority:** {top_task['title']} ({top_task['priority']} priority, score {top_task['score']}).")
                
            if schedule["events_count"] > 0:
                reply_lines.append(f"\n**Today's Schedule:** {schedule['events_count']} calendar events scheduled.")
                for ev in schedule["events"][:3]:
                    reply_lines.append(f"- `{ev['start_time']} - {ev['end_time']}`: **{ev['title']}** ({ev['event_type']})")
            else:
                reply_lines.append("\n**Today's Schedule:** No conflicting fixed events today. Great day for deep focus blocks!")

            suggested_actions.append({"label": "Open Daily Planner", "action": "NAVIGATE", "route": "/planner"})
            suggested_actions.append({"label": "View Upcoming Interviews", "action": "NAVIGATE", "route": "/interviews"})

        elif any(w in q_lower for w in ["deadline", "assignment", "due", "homework", "exam"]):
            deadlines = TOOL_REGISTRY["get_upcoming_deadlines"](db, user.id, days=7)
            tool_calls.append({"tool_name": "get_upcoming_deadlines", "arguments": {"days": 7}, "result_summary": f"Found {len(deadlines['assignments'])} assignments and {len(deadlines['tasks'])} tasks"})
            
            reply_lines = ["### Approaching Deadlines (Next 7 Days)", ""]
            if deadlines["assignments"]:
                reply_lines.append("**Academic Assignments:**")
                for a in deadlines["assignments"]:
                    reply_lines.append(f"- **{a['title']}** — Due `{a['due_at']}` (Priority: {a['priority']})")
            else:
                reply_lines.append("No academic assignments due in the next 7 days.")

            if deadlines["tasks"]:
                reply_lines.append("\n**Critical Planner Deadlines:**")
                for t in deadlines["tasks"]:
                    reply_lines.append(f"- **{t['title']}** — Due `{t['due_at']}` (Priority: {t['priority']})")
                    
            suggested_actions.append({"label": "View Academics", "action": "NAVIGATE", "route": "/academics"})

        elif any(w in q_lower for w in ["interview", "meeting", "interviewer", "prep"]):
            interviews = TOOL_REGISTRY["get_upcoming_interviews"](db, user.id)
            tool_calls.append({"tool_name": "get_upcoming_interviews", "arguments": {}, "result_summary": f"Found {interviews['count']} upcoming interviews"})
            
            reply_lines = ["### Upcoming Interview Schedule", ""]
            if interviews["count"] > 0:
                for iv in interviews["interviews"]:
                    reply_lines.append(f"**{iv['company']}** — {iv['role']}")
                    reply_lines.append(f"- **Round:** {iv['round']} ({iv['interview_type']})")
                    reply_lines.append(f"- **Time:** `{iv['start_at']}`")
                    if iv["meeting_link"]:
                        reply_lines.append(f"- **Link:** [{iv['meeting_link']}]({iv['meeting_link']})")
                    reply_lines.append(f"- **Prep Progress:** {iv['prep_progress']}")
                    if iv["conflicts_detected"]:
                        reply_lines.append("- ⚠️ *Schedule conflict detected with existing event!*")
                    reply_lines.append("")
                suggested_actions.append({"label": "Launch Interview Prep", "action": "NAVIGATE", "route": "/interviews"})
            else:
                reply_lines.append("You have no interviews scheduled right now. Continue applying to high-match opportunities!")
                suggested_actions.append({"label": "Browse Matched Jobs", "action": "NAVIGATE", "route": "/jobs"})

        elif any(w in q_lower for w in ["job", "match", "internship", "career", "role"]):
            jobs_data = TOOL_REGISTRY["get_best_job_matches"](db, user.id, limit=4, min_score=60.0)
            tool_calls.append({"tool_name": "get_best_job_matches", "arguments": {"limit": 4}, "result_summary": f"Found {jobs_data['count']} top matching opportunities"})
            
            reply_lines = ["### Recommended Job Matches", ""]
            if jobs_data["count"] > 0:
                for j in jobs_data["top_matches"]:
                    reply_lines.append(f"**{j['title']}** at **{j['company']}** — `{j['match_score']} Match`")
                    reply_lines.append(f"- Location: {j['location']} ({j['work_mode']})")
                    if j["matched_skills"]:
                        reply_lines.append(f"- Matched Skills: {', '.join(j['matched_skills'][:4])}")
                    if j["missing_skills"]:
                        reply_lines.append(f"- Suggested Focus: {', '.join(j['missing_skills'][:3])}")
                    reply_lines.append("")
            else:
                reply_lines.append("No high-match jobs found. Update your profile skills to improve match recommendations!")
                
            suggested_actions.append({"label": "View All Opportunities", "action": "NAVIGATE", "route": "/jobs"})

        elif any(w in q_lower for w in ["followup", "follow up", "application", "applied"]):
            followups = TOOL_REGISTRY["get_followups"](db, user.id)
            tool_calls.append({"tool_name": "get_followups", "arguments": {}, "result_summary": f"Found {followups['count']} pending follow-ups"})
            
            reply_lines = ["### Applications Needing Follow-up", ""]
            if followups["count"] > 0:
                for f in followups["follow_ups"]:
                    reply_lines.append(f"**{f['company']}** ({f['role']}) — Due `{f['due_date']}`")
                    reply_lines.append(f"> *Draft:* \"{f['suggested_message']}\"")
                    reply_lines.append("")
            else:
                reply_lines.append("All application follow-ups are up to date.")
            suggested_actions.append({"label": "View Application Pipeline", "action": "NAVIGATE", "route": "/applications"})

        elif any(w in q_lower for w in ["email", "inbox", "recruiter", "message"]):
            emails = TOOL_REGISTRY["get_important_emails"](db, user.id)
            tool_calls.append({"tool_name": "get_important_emails", "arguments": {}, "result_summary": f"Found {emails['count']} important emails"})
            
            reply_lines = ["### Important Inbox Items", ""]
            if emails["count"] > 0:
                for e in emails["emails"][:5]:
                    reply_lines.append(f"**[{e['category']}]** {e['subject']}")
                    reply_lines.append(f"- From: {e['sender']} (`{e['received_at']}`)")
                    if e["summary"]:
                        reply_lines.append(f"- Summary: {e['summary']}")
                    reply_lines.append("")
            else:
                reply_lines.append("No critical recruiter or academic emails in your inbox.")
            suggested_actions.append({"label": "Open Inbox", "action": "NAVIGATE", "route": "/inbox"})

        else:
            # Fallback general query with holistic status overview
            schedule = TOOL_REGISTRY["get_today_schedule"](db, user.id)
            tasks = TOOL_REGISTRY["get_tasks"](db, user.id)
            tool_calls.append({"tool_name": "get_today_schedule", "arguments": {}, "result_summary": "Retrieved schedule overview"})
            
            reply_lines = [
                f"Hello {user.full_name}! I am your Personal AI Student & Career Assistant.",
                "",
                "Here is your current status overview:",
                f"- **Active Tasks:** {tasks['count']} pending tasks in your planner.",
                f"- **Today's Events:** {schedule['events_count']} scheduled calendar events.",
                "",
                "You can ask me:",
                "- *\"What's important today?\"*",
                "- *\"Show my approaching assignment deadlines\"*",
                "- *\"What is my next interview?\"*",
                "- *\"Show Data Analyst jobs above 80% match\"*",
                "- *\"Which applications need follow-up?\"*",
            ]
            suggested_actions.append({"label": "Today's Priorities", "action": "QUERY", "query": "What should I focus on today?"})
            suggested_actions.append({"label": "Top Job Matches", "action": "QUERY", "query": "Show jobs above 80% match"})

        return {
            "reply": "\n".join(reply_lines),
            "tool_calls": tool_calls,
            "suggested_actions": suggested_actions,
            "grounded_entities": grounded_data,
        }

    @staticmethod
    def generate_interview_prep(db: Session, user: User, interview: Interview) -> InterviewPrep:
        """
        Generates structured, role-grounded technical and behavioral preparation modules.
        """
        prep = db.query(InterviewPrep).filter(InterviewPrep.interview_id == interview.id).first()
        if prep:
            return prep

        company = interview.company_name
        role = interview.role_title

        # Determine domain questions based on role keywords
        is_data = any(w in role.lower() for w in ["data", "analytics", "bi", "sql"])
        is_ml = any(w in role.lower() for w in ["machine learning", "ml", "ai", "data scientist"])
        
        top_skills = ["SQL", "Python", "Problem Solving", "System Design", "Communication"]
        if is_data:
            top_skills = ["SQL (Joins, Window Functions, Aggregations)", "Python (Pandas, NumPy)", "Data Modeling", "Business Metrics", "Power BI / Tableau"]
        elif is_ml:
            top_skills = ["Python", "PyTorch / TensorFlow", "Scikit-Learn", "Model Evaluation & Loss Functions", "Feature Engineering"]

        technical_questions = [
            {
                "question": "How do you handle missing or noisy data in production datasets?",
                "key_focus": "Discuss imputation strategies, median vs mean, domain-specific imputation, and flag columns."
            },
            {
                "question": "Explain the difference between WHERE and HAVING in complex aggregation queries.",
                "key_focus": "WHERE filters rows before aggregation; HAVING filters groups after GROUP BY."
            },
            {
                "question": f"Walk us through a notable technical project where you applied {top_skills[0]} to solve a real problem.",
                "key_focus": "Structure answer with STAR methodology (Situation, Task, Action, Result)."
            }
        ]

        sql_questions = [
            {
                "question": "Write a query to find the top 3 highest spending customers per region using window functions.",
                "sample_syntax": "SELECT customer_id, region, amount, DENSE_RANK() OVER (PARTITION BY region ORDER BY amount DESC) as rank FROM orders WHERE rank <= 3;"
            },
            {
                "question": "How would you optimize a slow join between a 50M row fact table and a dimension table?",
                "sample_syntax": "Ensure indexed foreign keys, partition pruning, filter before join, and avoid SELECT *."
            }
        ]

        python_questions = [
            {
                "question": "How do you optimize memory consumption when loading a 10GB CSV file in Python?",
                "sample_syntax": "Use chunksize in pandas.read_csv(), specify dtype dictionaries, or use polars / DuckDB."
            },
            {
                "question": "Explain list comprehension vs generator expressions and when to prefer generators.",
                "sample_syntax": "Generators evaluate lazily yielding one item at a time, conserving RAM for large pipelines."
            }
        ]

        behavioral_questions = [
            {
                "question": f"Why are you interested in joining {company} as a {role}?",
                "key_focus": "Highlight alignment with company mission, recent product launches, and personal growth goals."
            },
            {
                "question": "Describe a time you faced an ambiguous project requirement. How did you proceed?",
                "key_focus": "Emphasize stakeholder communication, clarifying questions, prototyping, and iterative feedback."
            }
        ]

        questions_to_ask = [
            f"What are the highest priority technical initiatives for the {role} team in the next 6 months?",
            "What does the day-to-day collaboration look like between engineering, product, and data stakeholders?",
            "How does your team evaluate success for this role during the first 90 days?"
        ]

        checklist = [
            f"Review {company} website, recent news, and product offerings.",
            f"Practice live SQL coding on window functions and aggregations.",
            f"Review key projects on your resume related to {top_skills[0]}.",
            "Prepare 2-minute elevator pitch and STAR stories.",
            "Verify webcam, microphone, lighting, and meeting link."
        ]

        prep = InterviewPrep(
            interview_id=interview.id,
            user_id=user.id,
            company_overview=f"{company} is an active employer seeking {role} talent with strengths in {', '.join(top_skills[:3])}.",
            role_summary=f"The {role} position focuses on delivering core technical solutions, data pipelines, and analytical insights.",
            top_skills_json=json.dumps(top_skills),
            technical_questions_json=json.dumps(technical_questions),
            behavioral_questions_json=json.dumps(behavioral_questions),
            sql_questions_json=json.dumps(sql_questions),
            python_questions_json=json.dumps(python_questions),
            questions_to_ask_json=json.dumps(questions_to_ask),
            preparation_checklist_json=json.dumps(checklist),
        )
        db.add(prep)
        db.commit()
        db.refresh(prep)
        return prep
