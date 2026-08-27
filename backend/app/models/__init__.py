from app.db.base import Base
from app.models.user import User, Profile, ConnectedAccount, OAuthCredential, SyncState
from app.models.academic import Course, Assignment, Announcement
from app.models.task import Task, TaskLink
from app.models.calendar_event import CalendarEvent
from app.models.email import EmailMessage, ExtractedFact
from app.models.career import Company, Job, Skill, UserSkill, JobSkill, JobMatch
from app.models.application import JobApplication, Interview, FollowUp
from app.models.resume import Resume, ResumeVersion, ResumeMatch
from app.models.notification import Notification, NotificationPreference
from app.models.ai import DailyDigest, WeeklyReport, InterviewPrep
from app.models.audit import AuditLog

__all__ = [
    "Base",
    "User",
    "Profile",
    "ConnectedAccount",
    "OAuthCredential",
    "SyncState",
    "Course",
    "Assignment",
    "Announcement",
    "Task",
    "TaskLink",
    "CalendarEvent",
    "EmailMessage",
    "ExtractedFact",
    "Company",
    "Job",
    "Skill",
    "UserSkill",
    "JobSkill",
    "JobMatch",
    "JobApplication",
    "Interview",
    "FollowUp",
    "Resume",
    "ResumeVersion",
    "ResumeMatch",
    "Notification",
    "NotificationPreference",
    "DailyDigest",
    "WeeklyReport",
    "InterviewPrep",
    "AuditLog",
]
