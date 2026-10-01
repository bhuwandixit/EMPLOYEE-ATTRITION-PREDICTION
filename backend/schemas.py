"""
Pydantic schemas for request validation, data serialization, and API contracts.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict


class EmployeePredictInput(BaseModel):
    """Features required to evaluate attrition risk for an individual employee."""
    
    # Optional identifier for linking
    EmployeeId: Optional[str] = Field(default=None, description="Unique Employee ID or code")
    
    # Personal & Demographics
    Age: int = Field(ge=18, le=65, default=35, description="Employee Age (18-65)")
    Gender: Literal["Male", "Female"] = Field(default="Male", description="Gender")
    MaritalStatus: Literal["Single", "Married", "Divorced"] = Field(default="Single", description="Marital status")
    Education: int = Field(ge=1, le=5, default=3, description="Education Level: 1-Below College, 2-College, 3-Bachelor, 4-Master, 5-Doctor")
    EducationField: str = Field(default="Life Sciences", description="Education background field")
    
    # Job Role & Workplace
    Department: Literal["Sales", "Research & Development", "Human Resources"] = Field(
        default="Research & Development", description="Company Department"
    )
    JobRole: str = Field(default="Research Scientist", description="Job Role Title")
    JobLevel: int = Field(ge=1, le=5, default=2, description="Job Level hierarchy (1 to 5)")
    BusinessTravel: Literal["Non-Travel", "Travel_Rarely", "Travel_Frequently"] = Field(
        default="Travel_Rarely", description="Frequency of business travel"
    )
    DistanceFromHome: int = Field(ge=1, le=50, default=8, description="Commute distance in miles")
    
    # Financials & Compensation
    MonthlyIncome: float = Field(ge=1000, le=30000, default=4500.0, description="Monthly income in USD")
    DailyRate: Optional[int] = Field(ge=100, le=1500, default=800, description="Daily rate")
    HourlyRate: Optional[int] = Field(ge=30, le=100, default=65, description="Hourly rate")
    MonthlyRate: Optional[int] = Field(ge=2000, le=30000, default=14000, description="Monthly rate")
    PercentSalaryHike: int = Field(ge=0, le=50, default=14, description="Percentage salary increase during last cycle")
    StockOptionLevel: int = Field(ge=0, le=3, default=1, description="Stock options tier (0 to 3)")
    
    # Satisfaction & Culture (1=Low, 2=Medium, 3=High, 4=Very High)
    EnvironmentSatisfaction: int = Field(ge=1, le=4, default=3, description="Environment satisfaction rating (1-4)")
    JobSatisfaction: int = Field(ge=1, le=4, default=3, description="Job satisfaction rating (1-4)")
    JobInvolvement: int = Field(ge=1, le=4, default=3, description="Job involvement rating (1-4)")
    RelationshipSatisfaction: int = Field(ge=1, le=4, default=3, description="Work relationship satisfaction (1-4)")
    WorkLifeBalance: int = Field(ge=1, le=4, default=3, description="Work life balance rating (1-4)")
    PerformanceRating: int = Field(ge=1, le=4, default=3, description="Performance evaluation rating (3-4)")
    
    # Work Experience & Tenure
    TotalWorkingYears: int = Field(ge=0, le=45, default=8, description="Total years of professional experience")
    YearsAtCompany: int = Field(ge=0, le=40, default=4, description="Years tenure at current company")
    YearsInCurrentRole: int = Field(ge=0, le=30, default=2, description="Years in current role")
    YearsSinceLastPromotion: int = Field(ge=0, le=30, default=1, description="Years elapsed since last promotion")
    YearsWithCurrManager: int = Field(ge=0, le=30, default=2, description="Years working under current manager")
    NumCompaniesWorked: int = Field(ge=0, le=15, default=2, description="Number of previous employers")
    TrainingTimesLastYear: int = Field(ge=0, le=10, default=2, description="Training sessions completed in last year")
    OverTime: Literal["Yes", "No"] = Field(default="No", description="Regularly required to work overtime")


class RiskThresholdConfig(BaseModel):
    low: float = Field(default=0.30, ge=0.0, le=1.0)
    high: float = Field(default=0.60, ge=0.0, le=1.0)


class ExplanatoryFactor(BaseModel):
    factor: str
    impact: str
    weight: float
    description: str


class PredictionResponse(BaseModel):
    prediction: Literal["Yes", "No"] = Field(description="Binary Attrition Prediction")
    probability: float = Field(description="Calibrated probability of leaving (0.0 to 1.0)")
    risk_level: Literal["Low", "Medium", "High"] = Field(description="Stratified Risk Category")
    message: str = Field(description="Operational guidance text")
    thresholds: Dict[str, float] = Field(default={"low": 0.30, "high": 0.60})
    top_explanatory_factors: List[ExplanatoryFactor] = Field(default_factory=list)


class PredictionHistoryRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    timestamp: datetime
    employee_id: Optional[str] = None
    age: Optional[int] = None
    department: Optional[str] = None
    job_role: Optional[str] = None
    monthly_income: Optional[float] = None
    years_at_company: Optional[float] = None
    overtime: Optional[str] = None
    prediction: str
    probability: float
    risk_level: str
    top_factors: Optional[List[Dict[str, Any]]] = None


class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    department: str
    job_role: str
    age: int
    monthly_income: float
    years_at_company: float
    overtime: Literal["Yes", "No"] = "No"
    business_travel: str = "Travel_Rarely"
    job_satisfaction: int = 3
    work_life_balance: int = 3


class EmployeeResponse(EmployeeCreate):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    attrition_risk: str
    probability: float
    last_assessed: datetime


class DashboardSummary(BaseModel):
    total_employees: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_attrition_probability: float
    department_distribution: List[Dict[str, Any]]
    job_role_distribution: List[Dict[str, Any]]
    overtime_distribution: List[Dict[str, Any]]
    recent_predictions: List[PredictionHistoryRecord]
