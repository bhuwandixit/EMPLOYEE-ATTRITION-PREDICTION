import React from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Users,
  History,
  BarChart3,
  FileCode2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'predict'
  | 'employees'
  | 'history'
  | 'analytics'
  | 'model-info';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  systemHealthy: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  systemHealthy,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Retention KPIs',
    },
    {
      id: 'predict' as NavTab,
      label: 'Predict Attrition',
      icon: BrainCircuit,
      description: 'Single & Batch ML Inference',
    },
    {
      id: 'employees' as NavTab,
      label: 'Employees',
      icon: Users,
      description: 'Workforce Roster & Risk Tiers',
    },
    {
      id: 'history' as NavTab,
      label: 'Prediction History',
      icon: History,
      description: 'Audit Trail & Records',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Drivers & Department Heatmaps',
    },
    {
      id: 'model-info' as NavTab,
      label: 'About Model',
      icon: FileCode2,
      description: 'Pipeline, ROC-AUC & Ethics',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-white text-base">AttriGuard</span>
                <span className="text-[10px] tracking-wider uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
                  ML
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-none mt-1">Attrition Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <div className="min-w-0">
                  <div className="truncate">{item.label}</div>
                  <div
                    className={`text-[11px] truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 text-xs space-y-3">
        <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400">Pipeline Status</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-emerald-400">Live</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Model</span>
              <span className="text-slate-200 font-mono">GBM Ensemble</span>
            </div>
            <div className="flex justify-between">
              <span>ROC-AUC</span>
              <span className="text-slate-200 font-mono">0.865</span>
            </div>
            <div className="flex justify-between">
              <span>Test Recall</span>
              <span className="text-slate-200 font-mono">78.8%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>FastAPI + RDS Stack</span>
          <span className="text-slate-400 font-mono">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
