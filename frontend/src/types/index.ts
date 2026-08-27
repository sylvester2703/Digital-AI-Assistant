export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  years_experience?: number;
}

export interface Profile {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  education?: string;
  degree?: string;
  branch?: string;
  grad_year?: number;
  target_roles: string[];
  target_locations: string[];
  remote_pref: "REMOTE" | "HYBRID" | "ONSITE" | "ANY";
  employment_pref: "INTERNSHIP" | "FULL_TIME" | "INTERNSHIP_OR_FULLTIME";
  expected_salary?: string;
  expected_stipend?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  certifications: string[];
  skills: UserSkill[];
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  calculated_score: number;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  due_at?: string;
  estimated_duration_minutes?: number;
  completed_at?: string;
  source_type: "MANUAL" | "EMAIL" | "CLASSROOM" | "ASSIGNMENT" | "INTERVIEW" | "AI_SUGGESTION";
  source_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: "CLASS" | "ASSIGNMENT" | "EXAM" | "INTERVIEW" | "MEETING" | "PERSONAL" | "DEADLINE" | "ASSESSMENT";
  start_at: string;
  end_at: string;
  all_day: boolean;
  location?: string;
  meeting_url?: string;
  source_type: string;
  source_id?: string;
  is_synced: boolean;
  google_event_id?: string;
  has_conflict: boolean;
  conflict_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractedFact {
  id: string;
  email_id: string;
  fact_type: string;
  fact_nature: "FACT" | "INFERENCE" | "RECOMMENDATION";
  value: string;
  confidence: number;
  evidence?: string;
  is_confirmed_by_user: boolean;
  converted_to_task: boolean;
  converted_task_id?: string;
}

export interface EmailMessage {
  id: string;
  user_id: string;
  provider_id: string;
  thread_id?: string;
  sender_name?: string;
  sender_email: string;
  recipient_email?: string;
  subject: string;
  snippet?: string;
  body_text?: string;
  received_at: string;
  category: "INTERVIEW" | "JOB_OPPORTUNITY" | "INTERNSHIP" | "COLLEGE" | "ASSIGNMENT" | "EXAM" | "MEETING" | "IMPORTANT" | "PROMOTIONAL" | "GENERAL" | "ASSESSMENT" | "APPLICATION_UPDATE" | "OFFER" | "REJECTION" | "ONBOARDING";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary?: string;
  is_read: boolean;
  is_archived: boolean;
  is_actionable: boolean;
  extracted_facts: ExtractedFact[];
  created_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  code: string;
  title: string;
  instructor?: string;
  term?: string;
  color: string;
  classroom_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  description?: string;
  due_at: string;
  max_points?: number;
  submission_status: "PENDING" | "SUBMITTED" | "GRADED" | "LATE";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  classroom_assignment_id?: string;
  course_code?: string;
  course_title?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  course_id: string;
  title: string;
  content: string;
  posted_at: string;
  author_name?: string;
  course_code?: string;
  course_title?: string;
}

export interface JobSkill {
  id: string;
  skill_name: string;
  is_required: boolean;
}

export interface Job {
  id: string;
  company_name: string;
  title: string;
  description: string;
  location: string;
  work_mode: "REMOTE" | "HYBRID" | "ONSITE";
  employment_type: "FULL_TIME" | "INTERNSHIP" | "CONTRACT";
  experience_level: "ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR";
  min_salary?: number;
  max_salary?: number;
  salary_currency: string;
  canonical_url?: string;
  source_name: string;
  posted_at: string;
  deadline_at?: string;
  skills: JobSkill[];
  match_score?: number;
  skill_score?: number;
  matched_skills: string[];
  missing_skills: string[];
  match_rationale?: string;
  is_saved: boolean;
  is_applied: boolean;
}

export interface Interview {
  id: string;
  user_id: string;
  application_id?: string;
  company_name: string;
  role_title: string;
  round_name: string;
  round_number: number;
  start_at: string;
  end_at: string;
  interview_type: string;
  meeting_link?: string;
  interviewer_info?: string;
  status: "SCHEDULED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  prep_progress_percent: number;
  conflicts_detected: boolean;
  created_at: string;
}

export interface FollowUp {
  id: string;
  application_id: string;
  company_name: string;
  role_title: string;
  recommended_at: string;
  due_date: string;
  suggested_message: string;
  status: "PENDING" | "COMPLETED" | "SNOOZED" | "IGNORED";
  notes?: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_id?: string;
  company_name: string;
  role_title: string;
  platform: string;
  applied_at: string;
  status: "SAVED" | "APPLIED" | "ASSESSMENT" | "INTERVIEW" | "SELECTED" | "REJECTED" | "OFFER" | "WITHDRAWN";
  recruiter_name?: string;
  recruiter_email?: string;
  location?: string;
  salary_offered?: string;
  notes?: string;
  follow_up_date?: string;
  last_status_change_at: string;
  interviews: Interview[];
  follow_ups: FollowUp[];
  created_at: string;
}

export interface InterviewPrep {
  id: string;
  interview_id: string;
  company_overview: string;
  role_summary: string;
  top_skills: string[];
  technical_questions: Array<{ question: string; key_focus: string }>;
  behavioral_questions: Array<{ question: string; key_focus: string }>;
  sql_questions: Array<{ question: string; sample_syntax: string }>;
  python_questions: Array<{ question: string; sample_syntax: string }>;
  questions_to_ask: string[];
  preparation_checklist: string[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: "CRITICAL" | "IMPORTANT" | "DIGEST";
  channel: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface ConnectedAccount {
  id: string;
  provider: "GOOGLE" | "GMAIL" | "GOOGLE_CALENDAR" | "GOOGLE_CLASSROOM" | "MICROSOFT" | "TELEGRAM";
  provider_account_id?: string;
  account_email?: string;
  scopes?: string;
  is_connected: boolean;
  last_synced_at?: string;
  error_message?: string;
}

export interface DashboardMetrics {
  critical_tasks_count: number;
  upcoming_deadlines_count: number;
  next_interview?: {
    id: string;
    company: string;
    role: string;
    start_at: string;
    meeting_link?: string;
    conflicts: boolean;
  };
  important_emails_count: number;
  top_job_matches_count: number;
  has_schedule_conflicts: boolean;
  greeting_name: string;
  today_date_str: string;
}

export interface ToolCallLog {
  tool_name: string;
  arguments: Record<string, any>;
  result_summary: string;
}

export interface AssistantQueryResponse {
  reply: string;
  tool_calls: ToolCallLog[];
  suggested_actions: Array<{
    label: string;
    action: "NAVIGATE" | "QUERY";
    route?: string;
    query?: string;
  }>;
  grounded_entities: Record<string, any>;
}
