export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ExplanatoryFactor {
  factor: string;
  impact: string;
  weight: number;
  description: string;
}

export interface PredictionResult {
  prediction: 'Yes' | 'No';
  probability: number;
  risk_level: RiskLevel;
  message: string;
  thresholds: {
    low: number;
    high: number;
  };
  top_explanatory_factors: ExplanatoryFactor[];
}

export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string;
  job_role: string;
  age: number;
  monthly_income: number;
  years_at_company: number;
  overtime: 'Yes' | 'No';
  business_travel: string;
  job_satisfaction: number;
  work_life_balance: number;
  attrition_risk: RiskLevel;
  probability: number;
  last_assessed: string;
}

export interface PredictionHistoryItem {
  id: number;
  timestamp: string;
  employee_id?: string;
  age: number;
  department: string;
  job_role: string;
  monthly_income: number;
  years_at_company: number;
  overtime: string;
  prediction: 'Yes' | 'No';
  probability: number;
  risk_level: RiskLevel;
  top_factors?: ExplanatoryFactor[];
}

export interface DashboardSummaryData {
  total_employees: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  avg_attrition_probability: number;
  department_distribution: Array<{
    department: string;
    count: number;
    risk_rate: number;
  }>;
  job_role_distribution: Array<{
    role: string;
    risk_rate: number;
    count: number;
  }>;
  overtime_distribution: Array<{
    overtime: string;
    count: number;
    attrition_pct: number;
  }>;
  recent_predictions: PredictionHistoryItem[];
}

export interface ModelMetadata {
  model_name: string;
  model_version: string;
  training_framework: string;
  training_date: string;
  dataset: string;
  total_records: number;
  train_samples: number;
  test_samples: number;
  selected_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: {
      true_negatives: number;
      false_positives: number;
      false_negatives: number;
      true_positives: number;
    };
  };
  benchmark_comparison: Array<{
    model: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  }>;
  risk_thresholds: {
    low: number;
    medium: number;
    high: number;
  };
  top_features: Array<{
    feature: string;
    importance: number;
    category: string;
  }>;
  disclaimer: string;
}
