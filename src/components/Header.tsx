import React from 'react';
import { NavTab } from './Sidebar';
import { Activity, RefreshCw, Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onNavigateToPredict: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  systemHealthy: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateToPredict,
  onRefresh,
  isRefreshing,
  systemHealthy,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Workforce Attrition Dashboard',
      subtitle: 'Real-time attrition vulnerability, departmental risk metrics & early retention signals',
    },
    predict: {
      title: 'Employee Attrition Prediction',
      subtitle: 'Evaluate individual or scenario employee parameters using calibrated ML pipeline',
    },
    employees: {
      title: 'Workforce Roster Management',
      subtitle: 'Active employee registry with calculated risk ratings, tenure, and filterable metrics',
    },
    history: {
      title: 'Prediction History & Audit Trail',
      subtitle: 'Immutable record of inference requests, calibrated probabilities and model signals',
    },
    analytics: {
      title: 'Retention & Workforce Analytics',
      subtitle: 'Multi-dimensional deep dive across overtime, salary bands, satisfaction, and roles',
    },
    'model-info': {
      title: 'ML Model Specifications & Evaluation',
      subtitle: 'Detailed architecture, training benchmark results, confusion matrix, ROC-AUC, and ethics',
    },
  };

  const current = titles[currentTab];

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 leading-tight">
          {current.title}
        </h1>
        <p className="text-xs text-slate-500 leading-none mt-0.5">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* System Health Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <span
            className={`h-2 w-2 rounded-full ${
              systemHealthy ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="font-medium text-slate-700">
            {systemHealthy ? 'FastAPI Gateway Active' : 'Connecting API'}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          title="Refresh Data"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
          />
        </button>

        {/* Quick Predict Action */}
        {currentTab !== 'predict' && (
          <button
            onClick={onNavigateToPredict}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm shadow-blue-600/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Score Employee</span>
          </button>
        )}
      </div>
    </header>
  );
};
