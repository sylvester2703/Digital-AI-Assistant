# Integration & OAuth Setup Guide

## Overview

Apex Assistant provides modular connectors for external productivity suites. In local development or demonstration mode, the platform runs with seed-backed deterministic pipelines so you can evaluate all features without requiring active cloud credentials.

---

## 1. Google Workspace (Gmail, Calendar, Classroom)

### Prerequisites:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the following APIs:
   - Gmail API
   - Google Calendar API
   - Google Classroom API
3. Create OAuth 2.0 Client ID Credentials (Web Application).
   - Authorized Redirect URI: `http://localhost:8000/api/v1/auth/google/callback`
4. Set the following environment variables in `backend/.env`:
   ```bash
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:8000/api/v1/auth/google/callback"
   ```

### Permissions Requested:
- `https://www.googleapis.com/auth/gmail.readonly` (Fetch email messages and interview invites)
- `https://www.googleapis.com/auth/calendar.events` (Two-way calendar sync)
- `https://www.googleapis.com/auth/classroom.courses.readonly` (Enrolled courses)
- `https://www.googleapis.com/auth/classroom.coursework.me` (Course assignments and submissions)

---

## 2. Telegram Bot Notifications

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to create your bot.
3. Copy the Bot API Token and add it to `backend/.env`:
   ```bash
   TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
   ```
4. Start your bot conversation and obtain your Chat ID via `@userinfobot`.

---

## 3. Disconnected & Demo Mode Behavior

When external OAuth credentials are not configured, the platform maintains a clean **"Disconnected"** state in the UI. No fake requests or broken network calls will occur. Users can toggle connections in the Connected Accounts page.
