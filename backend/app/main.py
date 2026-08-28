from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    analytics,
    applications,
    assistant,
    auth,
    calendar,
    courses,
    assignments,
    emails,
    integrations,
    interviews,
    jobs,
    notifications,
    profile,
    resumes,
    search,
    seed,
    tasks,
)
from app.core.config import settings
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    general_exception_handler,
)
from app.core.logging import logger
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.services.seed_service import seed_demo_environment


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is prepared and seed demo if empty
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed demo user if database is freshly created
        seed_demo_environment(db)
        logger.info("Seed check completed.")
    except Exception as e:
        logger.warning(f"Seed startup warning: {e}")
    finally:
        db.close()

    yield
    logger.info("Application shutdown.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Personal AI Student & Career Assistant API — Centralized intelligence for academics, career, and productivity.",
    lifespan=lifespan,
)

# Dynamic CORS Configuration
allowed_origins = list(settings.CORS_ORIGINS)
if settings.FRONTEND_ORIGIN:
    if settings.FRONTEND_ORIGIN == "*":
        allowed_origins = ["*"]
    elif settings.FRONTEND_ORIGIN not in allowed_origins:
        allowed_origins.append(settings.FRONTEND_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(profile.router, prefix=api_v1_prefix)
app.include_router(tasks.router, prefix=api_v1_prefix)
app.include_router(calendar.router, prefix=api_v1_prefix)
app.include_router(emails.router, prefix=api_v1_prefix)
app.include_router(courses.router, prefix=api_v1_prefix)
app.include_router(assignments.router, prefix=api_v1_prefix)
app.include_router(jobs.router, prefix=api_v1_prefix)
app.include_router(applications.router, prefix=api_v1_prefix)
app.include_router(interviews.router, prefix=api_v1_prefix)
app.include_router(resumes.router, prefix=api_v1_prefix)
app.include_router(assistant.router, prefix=api_v1_prefix)
app.include_router(notifications.router, prefix=api_v1_prefix)
app.include_router(analytics.router, prefix=api_v1_prefix)
app.include_router(integrations.router, prefix=api_v1_prefix)
app.include_router(search.router, prefix=api_v1_prefix)
app.include_router(seed.router, prefix=api_v1_prefix)


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API.",
        "documentation": "/docs",
        "health": "/api/v1/health",
    }
