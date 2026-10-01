import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PredictionHistoryItem } from '../types';
import { api } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictionHistory({
        limit: 100,
        risk_level: riskFilter !== 'All' ? riskFilter : undefined,
      });
      setHistory(data);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [riskFilter]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-900">
            Immutable Audit Trail ({history.length} events)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="text-slate-500 font-medium">Risk Filter:</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="All">All Risk Tiers</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-1.5 text-slate-500 hover:text-slate-800 border rounded-lg hover:bg-slate-50"
            title="Refresh History"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Compensation</th>
                <th className="py-3 px-4">OverTime</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Probability</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Retrieving audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No prediction history found. Run a prediction on the Predict tab!
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const isExpanded = expandedId === item.id;
                  const date = new Date(item.timestamp);
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-slate-50/90' : ''
                        }`}
                        onClick={() => toggleExpand(item.id)}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {item.employee_id || `INFERENCE-${item.id}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{item.job_role || 'Employee'}</div>
                          <div className="text-[11px] text-slate-400">{item.department}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {item.monthly_income ? `$${item.monthly_income.toLocaleString()}/mo` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              item.overtime === 'Yes' ? 'text-red-600' : 'text-slate-500'
                            }`}
                          >
                            {item.overtime || 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          <span
                            className={
                              item.prediction === 'Yes' ? 'text-red-600' : 'text-emerald-600'
                            }
                          >
                            Attrition: {item.prediction}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {(item.probability * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                              item.risk_level === 'High'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : item.risk_level === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {item.risk_level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600 p-1">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable row for driving factors */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 border-b border-slate-200">
                          <td colSpan={9} className="p-4">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                              <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                                <span>Model Attribution Factors</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  Instance Log ID #{item.id}
                                </span>
                              </div>
                              {item.top_factors && item.top_factors.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                                  {item.top_factors.map((f, i) => (
                                    <div
                                      key={i}
                                      className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px]"
                                    >
                                      <div className="font-semibold text-slate-800 flex justify-between">
                                        <span>{f.factor}</span>
                                        <span
                                          className={
                                            f.weight > 0 ? 'text-red-600' : 'text-emerald-600'
                                          }
                                        >
                                          {f.weight > 0 ? `+${f.weight}` : f.weight}
                                        </span>
                                      </div>
                                      <p className="text-slate-500 mt-0.5">{f.description}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400">
                                  No distinct outlier driver breakdown recorded for this evaluation.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
