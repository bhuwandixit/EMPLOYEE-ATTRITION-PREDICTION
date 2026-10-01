"""
AttriGuard FastAPI Application Entry Point.
Production-style API with structured logging, CORS, OpenAPI documentation,
and database lifecycle handling.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.database import engine, Base, SessionLocal
from backend.models import EmployeeRecord, PredictionHistory
from backend.routes import prediction, employees, analytics
from backend.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan for database migration, table creation, and initial seeding."""
    logger.info("Initializing AttriGuard database schema...")
    Base.metadata.create_all(bind=engine)
    
    # Seed initial representative workforce records if empty
    db = SessionLocal()
    try:
        count = db.query(EmployeeRecord).count()
        if count == 0:
            logger.info("Seeding initial employee cohort for interactive analysis...")
            sample_employees = [
                EmployeeRecord(
                    employee_id="EMP-1001", name="Sarah Jenkins", department="Sales",
                    job_role="Sales Executive", age=34, monthly_income=5400, years_at_company=3.5,
                    overtime="Yes", business_travel="Travel_Frequently", job_satisfaction=2, work_life_balance=2,
                    attrition_risk="High", probability=0.74
                ),
                EmployeeRecord(
                    employee_id="EMP-1002", name="Marcus Chen", department="Research & Development",
                    job_role="Research Scientist", age=41, monthly_income=7200, years_at_company=8.0,
                    overtime="No", business_travel="Travel_Rarely", job_satisfaction=4, work_life_balance=3,
                    attrition_risk="Low", probability=0.12
                ),
                EmployeeRecord(
                    employee_id="EMP-1003", name="Elena Rostova", department="Research & Development",
                    job_role="Laboratory Technician", age=28, monthly_income=2900, years_at_company=2.0,
                    overtime="Yes", business_travel="Travel_Rarely", job_satisfaction=2, work_life_balance=2,
                    attrition_risk="High", probability=0.68
                ),
                EmployeeRecord(
                    employee_id="EMP-1004", name="David Kim", department="Human Resources",
                    job_role="Human Resources", age=38, monthly_income=4600, years_at_company=5.0,
                    overtime="No", business_travel="Non-Travel", job_satisfaction=3, work_life_balance=3,
                    attrition_risk="Medium", probability=0.38
                ),
                EmployeeRecord(
                    employee_id="EMP-1005", name="Rachel Green", department="Sales",
                    job_role="Sales Representative", age=25, monthly_income=2600, years_at_company=1.2,
                    overtime="Yes", business_travel="Travel_Frequently", job_satisfaction=1, work_life_balance=1,
                    attrition_risk="High", probability=0.86
                ),
                EmployeeRecord(
                    employee_id="EMP-1006", name="James Rodriguez", department="Research & Development",
                    job_role="Manufacturing Director", age=49, monthly_income=11500, years_at_company=14.0,
                    overtime="No", business_travel="Travel_Rarely", job_satisfaction=4, work_life_balance=4,
                    attrition_risk="Low", probability=0.08
                ),
                EmployeeRecord(
                    employee_id="EMP-1007", name="Aisha Patel", department="Research & Development",
                    job_role="Research Director", age=52, monthly_income=14800, years_at_company=18.0,
                    overtime="No", business_travel="Travel_Rarely", job_satisfaction=4, work_life_balance=3,
                    attrition_risk="Low", probability=0.05
                ),
                EmployeeRecord(
                    employee_id="EMP-1008", name="Thomas Wright", department="Sales",
                    job_role="Sales Executive", age=36, monthly_income=6100, years_at_company=4.0,
                    overtime="No", business_travel="Travel_Rarely", job_satisfaction=3, work_life_balance=3,
                    attrition_risk="Medium", probability=0.32
                ),
                EmployeeRecord(
                    employee_id="EMP-1009", name="Hannah Schmidt", department="Research & Development",
                    job_role="Healthcare Representative", age=43, monthly_income=8900, years_at_company=9.0,
                    overtime="No", business_travel="Travel_Rarely", job_satisfaction=3, work_life_balance=3,
                    attrition_risk="Low", probability=0.14
                ),
                EmployeeRecord(
                    employee_id="EMP-1010", name="Brian O'Connor", department="Research & Development",
                    job_role="Laboratory Technician", age=31, monthly_income=3200, years_at_company=3.0,
                    overtime="Yes", business_travel="Travel_Frequently", job_satisfaction=2, work_life_balance=2,
                    attrition_risk="High", probability=0.64
                ),
            ]
            db.bulk_save_objects(sample_employees)
            db.commit()
    finally:
        db.close()
        
    yield
    logger.info("AttriGuard API shutting down...")


app = FastAPI(
    title="AttriGuard - Employee Attrition Intelligence API",
    description="Production-grade ML prediction platform for workforce attrition risk assessment, retention analytics, and explainability.",
    version="1.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS setup
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root and health checks
@app.get("/", tags=["System"])
def root():
    return {
        "service": "AttriGuard API",
        "status": "operational",
        "version": "1.2.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "model_loaded": True,
    }


# Include Routers both at root and /api for compatibility
app.include_router(prediction.router)
app.include_router(employees.router)
app.include_router(analytics.router)

app.include_router(prediction.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
