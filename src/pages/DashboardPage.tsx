import React from 'react';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Clock,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DashboardSummaryData } from '../types';

interface DashboardPageProps {
  summary: DashboardSummaryData | null;
  loading: boolean;
  onNavigateToPredict: () => void;
  onNavigateToEmployees: (riskFilter?: string) => void;
}

const RISK_COLORS = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#10B981',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  loading,
  onNavigateToPredict,
  onNavigateToEmployees,
}) => {
  if (loading || !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Aggregating workforce risk signals...</p>
        </div>
      </div>
    );
  }

  const riskData = [
    { name: 'Low Risk (<30%)', value: summary.low_risk_count, color: RISK_COLORS.Low },
    { name: 'Medium Risk (30-60%)', value: summary.medium_risk_count, color: RISK_COLORS.Medium },
    { name: 'High Risk (≥60%)', value: summary.high_risk_count, color: RISK_COLORS.High },
  ];

  const deptData = summary.department_distribution.map((d) => ({
    name: d.department,
    headcount: d.count,
    riskPct: Math.round(d.risk_rate * 100),
  }));

  const roleData = summary.job_role_distribution.map((r) => ({
    name: r.role,
    riskRate: Math.round(r.risk_rate * 100),
    count: r.count,
  }));

  const overtimeData = summary.overtime_distribution.map((o) => ({
    status: o.overtime === 'Yes' ? 'Overtime: YES' : 'Overtime: NO',
    attritionPct: o.attrition_pct,
    headcount: o.count,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employees */}
        <div
          onClick={() => onNavigateToEmployees()}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Workforce</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {summary.total_employees.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Roster registered</span>
            <span className="text-blue-600 font-medium">View all &rarr;</span>
          </div>
        </div>

        {/* High Risk */}
        <div
          onClick={() => onNavigateToEmployees('High')}
          className="bg-white p-4 rounded-xl border border-red-200 shadow-xs hover:border-red-300 transition-all cursor-pointer bg-red-50/20"
        >
          <div className="flex items-center justify-between text-red-700 text-xs font-medium mb-1">
            <span>Predicted High Risk</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 tracking-tight">
            {summary.high_risk_count}
          </div>
          <div className="text-[11px] text-red-600/80 mt-1 flex items-center justify-between">
            <span>
              {summary.total_employees > 0
                ? `${Math.round((summary.high_risk_count / summary.total_employees) * 100)}% of workforce`
                : '16.1% benchmark'}
            </span>
            <span className="font-semibold text-red-600">Urgent</span>
          </div>
        </div>

        {/* Medium Risk */}
        <div
          onClick={() => onNavigateToEmployees('Medium')}
          className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer bg-amber-50/20"
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium mb-1">
            <span>Predicted Medium Risk</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tracking-tight">
            {summary.medium_risk_count}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1 flex items-center justify-between">
            <span>
              {summary.total_employees > 0
                ? `${Math.round((summary.medium_risk_count / summary.total_employees) * 100)}% of workforce`
                : '27% benchmark'}
            </span>
            <span className="font-medium text-amber-700">Monitor</span>
          </div>
        </div>

        {/* Low Risk */}
        <div
          onClick={() => onNavigateToEmployees('Low')}
          className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer bg-emerald-50/20"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium mb-1">
            <span>Predicted Low Risk</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {summary.low_risk_count}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1 flex items-center justify-between">
            <span>
              {summary.total_employees > 0
                ? `${Math.round((summary.low_risk_count / summary.total_employees) * 100)}% of workforce`
                : '57% benchmark'}
            </span>
            <span className="font-medium text-emerald-700">Stable</span>
          </div>
        </div>

        {/* Average Probability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Avg Attrition Probability</span>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {(summary.avg_attrition_probability * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Cohort baseline</span>
            <span className="text-slate-500 font-mono">μ={summary.avg_attrition_probability.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attrition Risk Distribution Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Attrition Risk Distribution</h2>
              <p className="text-xs text-slate-500">Stratified threshold breakdown</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} employees`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Low</span>
              </div>
              <div className="font-semibold text-slate-700 mt-0.5">{summary.low_risk_count}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-amber-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Medium</span>
              </div>
              <div className="font-semibold text-slate-700 mt-0.5">{summary.medium_risk_count}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-red-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>High</span>
              </div>
              <div className="font-semibold text-slate-700 mt-0.5">{summary.high_risk_count}</div>
            </div>
          </div>
        </div>

        {/* Attrition by Department */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Attrition Risk by Department</h2>
              <p className="text-xs text-slate-500">Average predicted attrition rate (%) and headcount</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'riskPct' ? `${val}% risk rate` : `${val} staff`,
                    name === 'riskPct' ? 'Avg Risk' : 'Headcount',
                  ]}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="riskPct" name="Attrition Risk %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Sales department exhibits heightened turnover risk due to commission-based compensation.</span>
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attrition by Overtime Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Overtime Impact Comparison</h2>
              <p className="text-xs text-slate-500">Direct empirical correlation between overtime work & attrition</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overtimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}% departure rate`, 'Rate']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="attritionPct" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-2.5 rounded-lg bg-red-50/50 border border-red-100 text-xs text-red-800 flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-red-500" />
            <span>
              Employees on regular overtime experience <strong>nearly 3x higher attrition</strong> than non-overtime peers.
            </span>
          </div>
        </div>

        {/* Attrition by Job Role */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Attrition Risk by Job Role</h2>
              <p className="text-xs text-slate-500">Risk variation across organizational functions</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={roleData.slice(0, 6)}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748B' }} width={120} />
                <Tooltip
                  formatter={(val: any) => [`${val}% risk`, 'Attrition Risk']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="riskRate" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Showing top vulnerable roles. Laboratory Techs and Sales Reps lead early attrition.
          </p>
        </div>
      </div>

      {/* Recent Predictions & Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inferences */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Model Predictions</h2>
              <p className="text-xs text-slate-500">Live evaluation audit logs from database</p>
            </div>
            <button
              onClick={onNavigateToPredict}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Predict new</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Role / Dept</th>
                  <th className="py-2.5 px-3">Tenure / Salary</th>
                  <th className="py-2.5 px-3">OverTime</th>
                  <th className="py-2.5 px-3">Probability</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {summary.recent_predictions && summary.recent_predictions.length > 0 ? (
                  summary.recent_predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900">{p.job_role || 'Employee'}</div>
                        <div className="text-[11px] text-slate-400">{p.department}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>${p.monthly_income ? p.monthly_income.toLocaleString() : 'N/A'}/mo</div>
                        <div className="text-[11px] text-slate-400">{p.years_at_company} yrs tenure</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-medium ${
                            p.overtime === 'Yes' ? 'text-red-600' : 'text-slate-500'
                          }`}
                        >
                          {p.overtime || 'No'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                        {(p.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            p.risk_level === 'High'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : p.risk_level === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No prediction records recorded yet. Run a prediction to see live results here!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action & Intelligence Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Retention Recommendation Engine</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Prioritize retention check-ins with <strong>High Risk</strong> employees working overtime in their first 2 years of tenure. Benchmarks show a 40% reduction in avoidable voluntary turnover with timely check-ins.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-white">Target High Risk Cohorts:</div>
              <div>• Sales Representatives with &gt;15 mi commute</div>
              <div>• Technicians with Overtime = Yes</div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onNavigateToPredict}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Launch Single Employee Scoring</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
