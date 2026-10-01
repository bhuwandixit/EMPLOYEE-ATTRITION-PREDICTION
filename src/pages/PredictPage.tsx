import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sliders,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResult } from '../types';

interface PredictPageProps {
  onPredictionSuccess?: () => void;
}

export const PredictPage: React.FC<PredictPageProps> = ({ onPredictionSuccess }) => {
  // Preset scenarios
  const presets = {
    highRisk: {
      name: 'High Risk Profile: Overworked Sales Rep',
      data: {
        EmployeeId: 'EMP-SCENARIO-HIGH',
        Age: 26,
        Gender: 'Female',
        MaritalStatus: 'Single',
        Education: 2,
        EducationField: 'Marketing',
        Department: 'Sales',
        JobRole: 'Sales Representative',
        JobLevel: 1,
        BusinessTravel: 'Travel_Frequently',
        DistanceFromHome: 22,
        MonthlyIncome: 2450,
        DailyRate: 450,
        HourlyRate: 48,
        MonthlyRate: 11000,
        PercentSalaryHike: 11,
        StockOptionLevel: 0,
        EnvironmentSatisfaction: 1,
        JobSatisfaction: 1,
        JobInvolvement: 2,
        RelationshipSatisfaction: 2,
        WorkLifeBalance: 1,
        PerformanceRating: 3,
        TotalWorkingYears: 3,
        YearsAtCompany: 1,
        YearsInCurrentRole: 1,
        YearsSinceLastPromotion: 0,
        YearsWithCurrManager: 1,
        NumCompaniesWorked: 4,
        TrainingTimesLastYear: 1,
        OverTime: 'Yes',
      },
    },
    lowRisk: {
      name: 'Low Risk Profile: Senior R&D Director',
      data: {
        EmployeeId: 'EMP-SCENARIO-LOW',
        Age: 48,
        Gender: 'Male',
        MaritalStatus: 'Married',
        Education: 4,
        EducationField: 'Life Sciences',
        Department: 'Research & Development',
        JobRole: 'Research Director',
        JobLevel: 5,
        BusinessTravel: 'Travel_Rarely',
        DistanceFromHome: 3,
        MonthlyIncome: 14500,
        DailyRate: 1200,
        HourlyRate: 85,
        MonthlyRate: 22000,
        PercentSalaryHike: 18,
        StockOptionLevel: 2,
        EnvironmentSatisfaction: 4,
        JobSatisfaction: 4,
        JobInvolvement: 4,
        RelationshipSatisfaction: 4,
        WorkLifeBalance: 4,
        PerformanceRating: 4,
        TotalWorkingYears: 22,
        YearsAtCompany: 14,
        YearsInCurrentRole: 8,
        YearsSinceLastPromotion: 2,
        YearsWithCurrManager: 6,
        NumCompaniesWorked: 2,
        TrainingTimesLastYear: 4,
        OverTime: 'No',
      },
    },
    mediumRisk: {
      name: 'Medium Risk Profile: Mid-Level Lab Tech',
      data: {
        EmployeeId: 'EMP-SCENARIO-MED',
        Age: 32,
        Gender: 'Male',
        MaritalStatus: 'Divorced',
        Education: 3,
        EducationField: 'Medical',
        Department: 'Research & Development',
        JobRole: 'Laboratory Technician',
        JobLevel: 2,
        BusinessTravel: 'Travel_Rarely',
        DistanceFromHome: 12,
        MonthlyIncome: 4600,
        DailyRate: 850,
        HourlyRate: 60,
        MonthlyRate: 15000,
        PercentSalaryHike: 14,
        StockOptionLevel: 1,
        EnvironmentSatisfaction: 2,
        JobSatisfaction: 3,
        JobInvolvement: 3,
        RelationshipSatisfaction: 3,
        WorkLifeBalance: 2,
        PerformanceRating: 3,
        TotalWorkingYears: 7,
        YearsAtCompany: 3,
        YearsInCurrentRole: 2,
        YearsSinceLastPromotion: 1,
        YearsWithCurrManager: 2,
        NumCompaniesWorked: 2,
        TrainingTimesLastYear: 2,
        OverTime: 'No',
      },
    },
  };

  const [formData, setFormData] = useState<any>(presets.highRisk.data);
  const [lowThreshold, setLowThreshold] = useState<number>(0.3);
  const [highThreshold, setHighThreshold] = useState<number>(0.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.predictAttrition(formData, lowThreshold, highThreshold);
      setResult(response);
      if (onPredictionSuccess) {
        onPredictionSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Presets & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Load Profiles
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => {
                setFormData(presets.highRisk.data);
                setResult(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
            >
              High Risk Template (Sales Rep)
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(presets.lowRisk.data);
                setResult(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Low Risk Template (R&D Director)
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(presets.mediumRisk.data);
                setResult(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Medium Risk Template (Lab Tech)
            </button>
          </div>
        </div>

        {/* Configurable Risk Cutoffs */}
        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium text-slate-900">
            <Sliders className="h-3.5 w-3.5 text-blue-600" />
            <span>Risk Thresholds:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Low &lt;</span>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="0.5"
              value={lowThreshold}
              onChange={(e) => setLowThreshold(parseFloat(e.target.value))}
              className="w-14 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-center bg-white"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">High &ge;</span>
            <input
              type="number"
              step="0.05"
              min="0.4"
              max="0.9"
              value={highThreshold}
              onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
              className="w-14 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-center bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form Column (7 cols) */}
        <form onSubmit={handlePredict} className="lg:col-span-7 space-y-6">
          {/* Section 1: Personal & Demographics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">1. Personal & Demographics</h2>
              <p className="text-xs text-slate-500">Employee profile identifiers and personal traits</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.EmployeeId || ''}
                  onChange={(e) => handleInputChange('EmployeeId', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. EMP-1044"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Age ({formData.Age} yrs)</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={formData.Age}
                  onChange={(e) => handleInputChange('Age', parseInt(e.target.value) || 18)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.Gender}
                  onChange={(e) => handleInputChange('Gender', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Marital Status</label>
                <select
                  value={formData.MaritalStatus}
                  onChange={(e) => handleInputChange('MaritalStatus', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Education Level</label>
                <select
                  value={formData.Education}
                  onChange={(e) => handleInputChange('Education', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>1 - Below College</option>
                  <option value={2}>2 - College</option>
                  <option value={3}>3 - Bachelor</option>
                  <option value={4}>4 - Master</option>
                  <option value={5}>5 - Doctor</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Education Field</label>
                <select
                  value={formData.EducationField}
                  onChange={(e) => handleInputChange('EducationField', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Life Sciences">Life Sciences</option>
                  <option value="Medical">Medical</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Technical Degree">Technical Degree</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Job Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">2. Job Role & Assignment</h2>
              <p className="text-xs text-slate-500">Department placement and operational dynamics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={formData.Department}
                  onChange={(e) => handleInputChange('Department', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Sales">Sales</option>
                  <option value="Research & Development">Research & Development</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Role</label>
                <select
                  value={formData.JobRole}
                  onChange={(e) => handleInputChange('JobRole', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Research Scientist">Research Scientist</option>
                  <option value="Laboratory Technician">Laboratory Technician</option>
                  <option value="Manufacturing Director">Manufacturing Director</option>
                  <option value="Healthcare Representative">Healthcare Representative</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Research Director">Research Director</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Level (1 - 5)</label>
                <select
                  value={formData.JobLevel}
                  onChange={(e) => handleInputChange('JobLevel', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>Level 1 - Junior</option>
                  <option value={2}>Level 2 - Associate</option>
                  <option value={3}>Level 3 - Mid</option>
                  <option value={4}>Level 4 - Senior</option>
                  <option value={5}>Level 5 - Director</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Business Travel</label>
                <select
                  value={formData.BusinessTravel}
                  onChange={(e) => handleInputChange('BusinessTravel', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Non-Travel">Non-Travel</option>
                  <option value="Travel_Rarely">Travel Rarely</option>
                  <option value="Travel_Frequently">Travel Frequently</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Commute Distance ({formData.DistanceFromHome} mi)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.DistanceFromHome}
                  onChange={(e) =>
                    handleInputChange('DistanceFromHome', parseInt(e.target.value) || 1)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Stock Option Level</label>
                <select
                  value={formData.StockOptionLevel}
                  onChange={(e) => handleInputChange('StockOptionLevel', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={0}>0 - No Stock Options</option>
                  <option value={1}>1 - Standard Grant</option>
                  <option value={2}>2 - Enhanced Grant</option>
                  <option value={3}>3 - Executive Equity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Compensation & Overtime */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">3. Compensation & Workload</h2>
              <p className="text-xs text-slate-500">Financial incentives and work hour arrangements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Monthly Income ($USD)
                </label>
                <input
                  type="number"
                  step="100"
                  min="1000"
                  max="30000"
                  value={formData.MonthlyIncome}
                  onChange={(e) =>
                    handleInputChange('MonthlyIncome', parseFloat(e.target.value) || 3000)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Salary Hike Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.PercentSalaryHike}
                  onChange={(e) =>
                    handleInputChange('PercentSalaryHike', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              {/* Overtime Toggle */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Overtime Work Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleInputChange('OverTime', 'No')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      formData.OverTime === 'No'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    No Overtime
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('OverTime', 'Yes')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      formData.OverTime === 'Yes'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Yes (Overtime)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Satisfaction & Culture Ratings */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">4. Satisfaction & Well-Being</h2>
              <p className="text-xs text-slate-500">
                Subjective employee feedback ratings scale (1 = Low, 4 = Very High)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Satisfaction</label>
                <select
                  value={formData.JobSatisfaction}
                  onChange={(e) => handleInputChange('JobSatisfaction', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Medium</option>
                  <option value={3}>3 - High</option>
                  <option value={4}>4 - Very High</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Environment Satisfaction
                </label>
                <select
                  value={formData.EnvironmentSatisfaction}
                  onChange={(e) =>
                    handleInputChange('EnvironmentSatisfaction', parseInt(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Medium</option>
                  <option value={3}>3 - High</option>
                  <option value={4}>4 - Very High</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Work-Life Balance</label>
                <select
                  value={formData.WorkLifeBalance}
                  onChange={(e) => handleInputChange('WorkLifeBalance', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>1 - Bad (Imbalanced)</option>
                  <option value={2}>2 - Fair</option>
                  <option value={3}>3 - Good</option>
                  <option value={4}>4 - Excellent</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Involvement</label>
                <select
                  value={formData.JobInvolvement}
                  onChange={(e) => handleInputChange('JobInvolvement', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Medium</option>
                  <option value={3}>3 - High</option>
                  <option value={4}>4 - Very High</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Relationship Satisfaction
                </label>
                <select
                  value={formData.RelationshipSatisfaction}
                  onChange={(e) =>
                    handleInputChange('RelationshipSatisfaction', parseInt(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Medium</option>
                  <option value={3}>3 - High</option>
                  <option value={4}>4 - Very High</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Performance Rating</label>
                <select
                  value={formData.PerformanceRating}
                  onChange={(e) => handleInputChange('PerformanceRating', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={3}>3 - Meets Standard</option>
                  <option value={4}>4 - Exceeds Standard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Experience & Tenure */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">5. Tenure & Career History</h2>
              <p className="text-xs text-slate-500">Historical experience and organizational longevity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Total Career Years</label>
                <input
                  type="number"
                  min="0"
                  max="45"
                  value={formData.TotalWorkingYears}
                  onChange={(e) =>
                    handleInputChange('TotalWorkingYears', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Years at Company</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={formData.YearsAtCompany}
                  onChange={(e) =>
                    handleInputChange('YearsAtCompany', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Years in Current Role</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.YearsInCurrentRole}
                  onChange={(e) =>
                    handleInputChange('YearsInCurrentRole', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Years Since Last Promo</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.YearsSinceLastPromotion}
                  onChange={(e) =>
                    handleInputChange('YearsSinceLastPromotion', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Years With Manager</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.YearsWithCurrManager}
                  onChange={(e) =>
                    handleInputChange('YearsWithCurrManager', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Companies Worked</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={formData.NumCompaniesWorked}
                  onChange={(e) =>
                    handleInputChange('NumCompaniesWorked', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Evaluating Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Predict Attrition Risk</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Output Result Card Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <div className="font-semibold">Prediction Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {result ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-5">
              {/* Header Banner */}
              <div
                className={`p-5 border-b flex items-center justify-between ${
                  result.risk_level === 'High'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : result.risk_level === 'Medium'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-lg flex items-center justify-center ${
                      result.risk_level === 'High'
                        ? 'bg-red-600 text-white shadow-sm'
                        : result.risk_level === 'Medium'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-emerald-600 text-white shadow-sm'
                    }`}
                  >
                    {result.risk_level === 'High' ? (
                      <ShieldAlert className="h-6 w-6" />
                    ) : result.risk_level === 'Medium' ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <ShieldCheck className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                      Evaluated Risk Category
                    </div>
                    <div className="text-xl font-bold tracking-tight">
                      {result.risk_level.toUpperCase()} RISK
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">
                    Probability
                  </div>
                  <div className="text-2xl font-black font-mono">
                    {(result.probability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="px-5 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Vulnerability Meter</span>
                  <span className="font-mono text-slate-700">
                    Threshold: {result.thresholds.high * 100}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.risk_level === 'High'
                        ? 'bg-red-500'
                        : result.risk_level === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, result.probability * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (Safe)</span>
                  <span>30% (Medium)</span>
                  <span>60% (High)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Operational Guidance Message */}
              <div className="px-5">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <div className="font-semibold text-slate-900 mb-0.5">Model Assessment:</div>
                  <p>{result.message}</p>
                </div>
              </div>

              {/* Explanatory Factors Section */}
              <div className="px-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Model Explanatory Signals
                  </h3>
                  <span className="text-[10px] text-slate-400">Statistical attribution</span>
                </div>

                <div className="space-y-2.5">
                  {result.top_explanatory_factors && result.top_explanatory_factors.length > 0 ? (
                    result.top_explanatory_factors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-900">{factor.factor}</span>
                          <span
                            className={`flex items-center gap-1 font-mono text-[11px] ${
                              factor.weight > 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            {factor.weight > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {factor.weight > 0 ? `+${factor.weight}` : factor.weight}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {factor.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No outlier risk drivers detected.</p>
                  )}
                </div>
              </div>

              {/* Disclaimer / Ethics Note */}
              <div className="px-5 pb-5">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
                  <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Statistical Notice:</strong> These outputs represent estimated probabilities derived from historic patterns. They do not constitute deterministic or causal assertions.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Ready to Evaluate</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Fill in the employee details on the left, or choose a preset profile from the top bar to run real-time inference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
