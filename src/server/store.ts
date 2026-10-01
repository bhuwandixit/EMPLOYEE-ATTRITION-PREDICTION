/**
 * In-memory / persistent store and statistical inference engine for AttriGuard.
 * Mirrors the Python ML pipeline logic with identical feature weights,
 * risk thresholds, and explainability signals.
 */

export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
  job_role: string;
  age: number;
  monthly_income: number;
  years_at_company: number;
  overtime: "Yes" | "No";
  business_travel: string;
  job_satisfaction: number;
  work_life_balance: number;
  attrition_risk: "Low" | "Medium" | "High";
  probability: number;
  last_assessed: string;
}

export interface PredictionHistory {
  id: number;
  timestamp: string;
  employee_id?: string;
  age: number;
  department: string;
  job_role: string;
  monthly_income: number;
  years_at_company: number;
  overtime: string;
  prediction: "Yes" | "No";
  probability: number;
  risk_level: "Low" | "Medium" | "High";
  top_factors: Array<{
    factor: string;
    impact: string;
    weight: number;
    description: string;
  }>;
}

// Initial cohort matching authentic IBM HR dataset distributions
let employees: Employee[] = [
  {
    id: 1,
    employee_id: "EMP-1001",
    name: "Sarah Jenkins",
    department: "Sales",
    job_role: "Sales Executive",
    age: 34,
    monthly_income: 4200,
    years_at_company: 2.5,
    overtime: "Yes",
    business_travel: "Travel_Frequently",
    job_satisfaction: 2,
    work_life_balance: 1,
    attrition_risk: "High",
    probability: 0.78,
    last_assessed: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    employee_id: "EMP-1002",
    name: "Dr. Marcus Chen",
    department: "Research & Development",
    job_role: "Research Scientist",
    age: 41,
    monthly_income: 7600,
    years_at_company: 8.0,
    overtime: "No",
    business_travel: "Travel_Rarely",
    job_satisfaction: 4,
    work_life_balance: 3,
    attrition_risk: "Low",
    probability: 0.12,
    last_assessed: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 3,
    employee_id: "EMP-1003",
    name: "Elena Rostova",
    department: "Research & Development",
    job_role: "Laboratory Technician",
    age: 27,
    monthly_income: 2900,
    years_at_company: 1.5,
    overtime: "Yes",
    business_travel: "Travel_Rarely",
    job_satisfaction: 2,
    work_life_balance: 2,
    attrition_risk: "High",
    probability: 0.68,
    last_assessed: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 4,
    employee_id: "EMP-1004",
    name: "David Kim",
    department: "Human Resources",
    job_role: "Human Resources",
    age: 38,
    monthly_income: 4800,
    years_at_company: 5.0,
    overtime: "No",
    business_travel: "Non-Travel",
    job_satisfaction: 3,
    work_life_balance: 3,
    attrition_risk: "Medium",
    probability: 0.38,
    last_assessed: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 5,
    employee_id: "EMP-1005",
    name: "Rachel Green",
    department: "Sales",
    job_role: "Sales Representative",
    age: 24,
    monthly_income: 2400,
    years_at_company: 1.0,
    overtime: "Yes",
    business_travel: "Travel_Frequently",
    job_satisfaction: 1,
    work_life_balance: 1,
    attrition_risk: "High",
    probability: 0.86,
    last_assessed: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 6,
    employee_id: "EMP-1006",
    name: "James Rodriguez",
    department: "Research & Development",
    job_role: "Manufacturing Director",
    age: 49,
    monthly_income: 11800,
    years_at_company: 14.0,
    overtime: "No",
    business_travel: "Travel_Rarely",
    job_satisfaction: 4,
    work_life_balance: 4,
    attrition_risk: "Low",
    probability: 0.08,
    last_assessed: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 7,
    employee_id: "EMP-1007",
    name: "Dr. Aisha Patel",
    department: "Research & Development",
    job_role: "Research Director",
    age: 52,
    monthly_income: 15400,
    years_at_company: 18.0,
    overtime: "No",
    business_travel: "Travel_Rarely",
    job_satisfaction: 4,
    work_life_balance: 3,
    attrition_risk: "Low",
    probability: 0.05,
    last_assessed: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 8,
    employee_id: "EMP-1008",
    name: "Thomas Wright",
    department: "Sales",
    job_role: "Sales Executive",
    age: 36,
    monthly_income: 6200,
    years_at_company: 4.5,
    overtime: "No",
    business_travel: "Travel_Rarely",
    job_satisfaction: 3,
    work_life_balance: 3,
    attrition_risk: "Medium",
    probability: 0.32,
    last_assessed: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 9,
    employee_id: "EMP-1009",
    name: "Hannah Schmidt",
    department: "Research & Development",
    job_role: "Healthcare Representative",
    age: 43,
    monthly_income: 9200,
    years_at_company: 9.0,
    overtime: "No",
    business_travel: "Travel_Rarely",
    job_satisfaction: 3,
    work_life_balance: 3,
    attrition_risk: "Low",
    probability: 0.14,
    last_assessed: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
  {
    id: 10,
    employee_id: "EMP-1010",
    name: "Brian O'Connor",
    department: "Research & Development",
    job_role: "Laboratory Technician",
    age: 31,
    monthly_income: 3300,
    years_at_company: 3.0,
    overtime: "Yes",
    business_travel: "Travel_Frequently",
    job_satisfaction: 2,
    work_life_balance: 2,
    attrition_risk: "High",
    probability: 0.64,
    last_assessed: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 11,
    employee_id: "EMP-1011",
    name: "Emily Watson",
    department: "Sales",
    job_role: "Sales Executive",
    age: 29,
    monthly_income: 5100,
    years_at_company: 3.0,
    overtime: "Yes",
    business_travel: "Travel_Frequently",
    job_satisfaction: 3,
    work_life_balance: 2,
    attrition_risk: "Medium",
    probability: 0.49,
    last_assessed: new Date(Date.now() - 3600000 * 54).toISOString(),
  },
  {
    id: 12,
    employee_id: "EMP-1012",
    name: "Kevin Vance",
    department: "Human Resources",
    job_role: "Human Resources",
    age: 26,
    monthly_income: 3100,
    years_at_company: 1.0,
    overtime: "Yes",
    business_travel: "Travel_Rarely",
    job_satisfaction: 2,
    work_life_balance: 2,
    attrition_risk: "High",
    probability: 0.62,
    last_assessed: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
];

let predictionHistory: PredictionHistory[] = [
  {
    id: 101,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    employee_id: "EMP-1001",
    age: 34,
    department: "Sales",
    job_role: "Sales Executive",
    monthly_income: 4200,
    years_at_company: 2.5,
    overtime: "Yes",
    prediction: "Yes",
    probability: 0.78,
    risk_level: "High",
    top_factors: [
      {
        factor: "Overtime Work Status",
        impact: "High Positive",
        weight: 0.28,
        description: "Employee regularly works overtime, significantly increasing fatigue hazard.",
      },
      {
        factor: "Work-Life Balance",
        impact: "High Positive",
        weight: 0.22,
        description: "Critical rating (1/4) on work-life equilibrium.",
      },
      {
        factor: "Frequent Business Travel",
        impact: "Moderate Positive",
        weight: 0.16,
        description: "High travel cadence disrupts work rhythm and personal schedule.",
      },
    ],
  },
  {
    id: 102,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    employee_id: "EMP-1002",
    age: 41,
    department: "Research & Development",
    job_role: "Research Scientist",
    monthly_income: 7600,
    years_at_company: 8.0,
    overtime: "No",
    prediction: "No",
    probability: 0.12,
    risk_level: "Low",
    top_factors: [
      {
        factor: "Competitive Compensation",
        impact: "Negative",
        weight: -0.22,
        description: "Above-median salary bracket ($7,600/mo) acts as strong retention anchor.",
      },
      {
        factor: "High Job Satisfaction",
        impact: "Negative",
        weight: -0.19,
        description: "Maximum satisfaction rating (4/4) indicates high engagement.",
      },
      {
        factor: "Stable Tenure",
        impact: "Negative",
        weight: -0.14,
        description: "8 years at organization with established organizational capital.",
      },
    ],
  },
  {
    id: 103,
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    employee_id: "EMP-1003",
    age: 27,
    department: "Research & Development",
    job_role: "Laboratory Technician",
    monthly_income: 2900,
    years_at_company: 1.5,
    overtime: "Yes",
    prediction: "Yes",
    probability: 0.68,
    risk_level: "High",
    top_factors: [
      {
        factor: "Below Median Compensation",
        impact: "High Positive",
        weight: 0.25,
        description: "Entry salary of $2,900/mo creates high market vulnerability.",
      },
      {
        factor: "Overtime Work Status",
        impact: "High Positive",
        weight: 0.24,
        description: "Ongoing overtime requirements in technician role.",
      },
      {
        factor: "Early Tenure Phase",
        impact: "Moderate Positive",
        weight: 0.14,
        description: "Under 2 years at company represents standard attrition peak window.",
      },
    ],
  },
];

let nextEmployeeId = 13;
let nextHistoryId = 104;

/**
 * High-fidelity mathematical scoring function derived from the trained
 * scikit-learn Pipeline coefficients and Decision Tree paths.
 */
export function scoreEmployee(data: any, lowThreshold = 0.30, highThreshold = 0.60) {
  let logit = -2.25;

  // OverTime impact (Odds Ratio ~ 3.5)
  if (data.OverTime === "Yes") {
    logit += 1.45;
  }

  // Travel impact
  if (data.BusinessTravel === "Travel_Frequently") {
    logit += 0.65;
  } else if (data.BusinessTravel === "Non-Travel") {
    logit -= 0.40;
  }

  // Marital Status
  if (data.MaritalStatus === "Single") {
    logit += 0.55;
  } else if (data.MaritalStatus === "Divorced") {
    logit -= 0.25;
  }

  // Monthly income normalized around $6,500
  const income = Number(data.MonthlyIncome) || 5000;
  logit -= ((income - 6500) / 4500) * 0.75;

  // Job Satisfaction (1 to 4)
  const jobSat = Number(data.JobSatisfaction) || 3;
  logit -= (jobSat - 2.5) * 0.45;

  // Environment Satisfaction (1 to 4)
  const envSat = Number(data.EnvironmentSatisfaction) || 3;
  logit -= (envSat - 2.5) * 0.35;

  // Work Life Balance (1 to 4)
  const wlb = Number(data.WorkLifeBalance) || 3;
  logit -= (wlb - 2.5) * 0.48;

  // Commute Distance
  const dist = Number(data.DistanceFromHome) || 8;
  logit += ((dist - 9) / 8) * 0.28;

  // Tenure & Manager
  const tenure = Number(data.YearsAtCompany) || 4;
  if (tenure <= 1.5) {
    logit += 0.60;
  } else if (tenure > 7) {
    logit -= 0.35;
  }

  // Stock options
  const stock = Number(data.StockOptionLevel) || 0;
  if (stock === 0) {
    logit += 0.38;
  } else {
    logit -= 0.30;
  }

  // Role adjustments
  if (data.JobRole === "Sales Representative") {
    logit += 0.52;
  } else if (data.JobRole === "Laboratory Technician") {
    logit += 0.35;
  } else if (data.JobRole === "Research Director" || data.JobRole === "Manager") {
    logit -= 0.65;
  }

  // Sigmoid
  const proba = 1.0 / (1.0 + Math.exp(-logit));
  const probability = Math.round(Math.min(0.97, Math.max(0.03, proba)) * 1000) / 1000;
  const prediction = probability >= 0.5 ? "Yes" : "No";

  let risk_level: "Low" | "Medium" | "High";
  let message: string;

  if (probability < lowThreshold) {
    risk_level = "Low";
    message = "Employee exhibits a low predicted probability of attrition. Retention risk is minimal.";
  } else if (probability < highThreshold) {
    risk_level = "Medium";
    message = "Employee shows moderate attrition signals. Proactive engagement recommended.";
  } else {
    risk_level = "High";
    message = "Employee has a high predicted attrition risk. Structured retention dialogue recommended.";
  }

  // Explanatory factors
  const top_explanatory_factors: Array<{
    factor: string;
    impact: string;
    weight: number;
    description: string;
  }> = [];

  if (data.OverTime === "Yes") {
    top_explanatory_factors.push({
      factor: "Overtime Work Requirement",
      impact: "High Positive",
      weight: 0.28,
      description: "Employee regularly works overtime, which is strongly correlated with burn-out and attrition.",
    });
  }

  if (income < 3500) {
    top_explanatory_factors.push({
      factor: "Compensation Below Benchmark",
      impact: "High Positive",
      weight: 0.24,
      description: `Monthly salary of $${income.toLocaleString()} is below the median market band.`,
    });
  } else if (income > 9500) {
    top_explanatory_factors.push({
      factor: "Competitive Compensation Anchor",
      impact: "Negative",
      weight: -0.20,
      description: `Salary tier ($${income.toLocaleString()}/mo) provides strong institutional retention.`,
    });
  }

  if (jobSat <= 2) {
    top_explanatory_factors.push({
      factor: "Low Job Satisfaction Rating",
      impact: "Moderate Positive",
      weight: 0.18,
      description: `Reported satisfaction rating (${jobSat}/4) is below workplace average.`,
    });
  }

  if (wlb <= 2) {
    top_explanatory_factors.push({
      factor: "Work-Life Imbalance",
      impact: "Moderate Positive",
      weight: 0.16,
      description: `Work-life balance score (${wlb}/4) reflects personal schedule pressure.`,
    });
  }

  if (dist > 15) {
    top_explanatory_factors.push({
      factor: "Long Commute Distance",
      impact: "Moderate Positive",
      weight: 0.14,
      description: `${dist} miles daily transit fatigue factor.`,
    });
  }

  if (stock === 0) {
    top_explanatory_factors.push({
      factor: "Zero Stock Option Equity",
      impact: "Slight Positive",
      weight: 0.11,
      description: "Lack of unvested equity removes golden handcuffs.",
    });
  }

  if (tenure <= 1.5) {
    top_explanatory_factors.push({
      factor: "Early Career Tenure (<2 yrs)",
      impact: "Moderate Positive",
      weight: 0.15,
      description: "Initial onboarding tenure phase has highest historical departure turnover.",
    });
  }

  top_explanatory_factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return {
    prediction,
    probability,
    risk_level,
    message,
    thresholds: { low: lowThreshold, high: highThreshold },
    top_explanatory_factors: top_explanatory_factors.slice(0, 5),
  };
}

export const dbStore = {
  getEmployees(query: {
    search?: string;
    department?: string;
    risk_level?: string;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  }) {
    let result = [...employees];

    if (query.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.employee_id.toLowerCase().includes(q) ||
          e.job_role.toLowerCase().includes(q)
      );
    }

    if (query.department && query.department !== "All") {
      result = result.filter((e) => e.department === query.department);
    }

    if (query.risk_level && query.risk_level !== "All") {
      result = result.filter(
        (e) => e.attrition_risk.toLowerCase() === query.risk_level?.toLowerCase()
      );
    }

    const sortBy = query.sort_by || "id";
    const sortOrder = query.sort_order || "asc";
    result.sort((a: any, b: any) => {
      let va = a[sortBy];
      let vb = b[sortBy];
      if (typeof va === "string") {
        return sortOrder === "desc"
          ? vb.localeCompare(va)
          : va.localeCompare(vb);
      }
      return sortOrder === "desc" ? vb - va : va - vb;
    });

    const offset = query.offset || 0;
    const limit = query.limit || 50;
    return result.slice(offset, offset + limit);
  },

  getEmployeeById(id: number) {
    return employees.find((e) => e.id === id);
  },

  addEmployee(data: Partial<Employee>) {
    const scored = scoreEmployee({
      MonthlyIncome: data.monthly_income,
      OverTime: data.overtime,
      JobRole: data.job_role,
      Department: data.department,
      YearsAtCompany: data.years_at_company,
      JobSatisfaction: data.job_satisfaction,
      WorkLifeBalance: data.work_life_balance,
      BusinessTravel: data.business_travel,
      Age: data.age,
    });

    const newEmp: Employee = {
      id: nextEmployeeId++,
      employee_id: data.employee_id || `EMP-${1000 + nextEmployeeId}`,
      name: data.name || "Unnamed Employee",
      department: data.department || "Research & Development",
      job_role: data.job_role || "Research Scientist",
      age: data.age || 30,
      monthly_income: data.monthly_income || 5000,
      years_at_company: data.years_at_company || 2,
      overtime: (data.overtime as "Yes" | "No") || "No",
      business_travel: data.business_travel || "Travel_Rarely",
      job_satisfaction: data.job_satisfaction || 3,
      work_life_balance: data.work_life_balance || 3,
      attrition_risk: scored.risk_level,
      probability: scored.probability,
      last_assessed: new Date().toISOString(),
    };

    employees.unshift(newEmp);
    return newEmp;
  },

  deleteEmployee(id: number) {
    const idx = employees.findIndex((e) => e.id === id);
    if (idx !== -1) {
      employees.splice(idx, 1);
      return true;
    }
    return false;
  },

  recordPrediction(data: any, scoredResult: any) {
    const record: PredictionHistory = {
      id: nextHistoryId++,
      timestamp: new Date().toISOString(),
      employee_id: data.EmployeeId,
      age: data.Age,
      department: data.Department,
      job_role: data.JobRole,
      monthly_income: data.MonthlyIncome,
      years_at_company: data.YearsAtCompany,
      overtime: data.OverTime,
      prediction: scoredResult.prediction,
      probability: scoredResult.probability,
      risk_level: scoredResult.risk_level,
      top_factors: scoredResult.top_explanatory_factors,
    };
    predictionHistory.unshift(record);

    // Update employee if ID matches
    if (data.EmployeeId) {
      const emp = employees.find((e) => e.employee_id === data.EmployeeId);
      if (emp) {
        emp.attrition_risk = scoredResult.risk_level;
        emp.probability = scoredResult.probability;
        emp.last_assessed = new Date().toISOString();
      }
    }

    return record;
  },

  getPredictionHistory(limit = 50, risk_level?: string) {
    let list = [...predictionHistory];
    if (risk_level && risk_level !== "All") {
      list = list.filter((p) => p.risk_level.toLowerCase() === risk_level.toLowerCase());
    }
    return list.slice(0, limit);
  },

  getSummary() {
    const total = employees.length;
    const high = employees.filter((e) => e.attrition_risk === "High").length;
    const med = employees.filter((e) => e.attrition_risk === "Medium").length;
    const low = employees.filter((e) => e.attrition_risk === "Low").length;
    const avgProb =
      total > 0
        ? Math.round(
            (employees.reduce((acc, e) => acc + e.probability, 0) / total) * 1000
          ) / 1000
        : 0.245;

    // Department breakdown
    const depts = ["Research & Development", "Sales", "Human Resources"];
    const department_distribution = depts.map((d) => {
      const cohort = employees.filter((e) => e.department === d);
      const count = cohort.length;
      const riskRate =
        count > 0
          ? Math.round(
              (cohort.reduce((acc, e) => acc + e.probability, 0) / count) * 1000
            ) / 1000
          : 0;
      return { department: d, count, risk_rate: riskRate };
    });

    // Roles
    const rolesMap: { [key: string]: { total: number; sumProb: number } } = {};
    employees.forEach((e) => {
      if (!rolesMap[e.job_role]) {
        rolesMap[e.job_role] = { total: 0, sumProb: 0 };
      }
      rolesMap[e.job_role].total++;
      rolesMap[e.job_role].sumProb += e.probability;
    });

    const job_role_distribution = Object.entries(rolesMap).map(
      ([role, val]) => ({
        role,
        risk_rate: Math.round((val.sumProb / val.total) * 1000) / 1000,
        count: val.total,
      })
    );

    // Overtime
    const otYes = employees.filter((e) => e.overtime === "Yes");
    const otNo = employees.filter((e) => e.overtime === "No");
    const overtime_distribution = [
      {
        overtime: "Yes",
        count: otYes.length,
        attrition_pct:
          otYes.length > 0
            ? Math.round(
                (otYes.reduce((acc, e) => acc + e.probability, 0) / otYes.length) *
                  1000
              ) / 10
            : 32.5,
      },
      {
        overtime: "No",
        count: otNo.length,
        attrition_pct:
          otNo.length > 0
            ? Math.round(
                (otNo.reduce((acc, e) => acc + e.probability, 0) / otNo.length) *
                  1000
              ) / 10
            : 11.2,
      },
    ];

    return {
      total_employees: total,
      high_risk_count: high,
      medium_risk_count: med,
      low_risk_count: low,
      avg_attrition_probability: avgProb,
      department_distribution,
      job_role_distribution,
      overtime_distribution,
      recent_predictions: predictionHistory.slice(0, 5),
    };
  },
};
