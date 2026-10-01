/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { PredictPage } from './pages/PredictPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { api } from './services/api';
import { DashboardSummaryData, Employee, ModelMetadata } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemHealthy, setSystemHealthy] = useState(true);
  const [employeeRiskFilter, setEmployeeRiskFilter] = useState<string>('All');

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const [sumRes, empRes, metaRes, healthRes] = await Promise.allSettled([
        api.getSummary(),
        api.getEmployees({ limit: 100 }),
        api.getModelInfo(),
        api.getHealth(),
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value);
      if (metaRes.status === 'fulfilled') setMetadata(metaRes.value);
      if (healthRes.status === 'fulfilled') setSystemHealthy(true);
    } catch (err) {
      console.error('Failed to load application data:', err);
      setSystemHealthy(false);
    } finally {
      setLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const navigateToEmployeesWithFilter = (riskFilter?: string) => {
    if (riskFilter) {
      setEmployeeRiskFilter(riskFilter);
    } else {
      setEmployeeRiskFilter('All');
    }
    setCurrentTab('employees');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        systemHealthy={systemHealthy}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onNavigateToPredict={() => setCurrentTab('predict')}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
          systemHealthy={systemHealthy}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {currentTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              loading={loading}
              onNavigateToPredict={() => setCurrentTab('predict')}
              onNavigateToEmployees={navigateToEmployeesWithFilter}
            />
          )}

          {currentTab === 'predict' && (
            <PredictPage
              onPredictionSuccess={() => {
                loadData();
              }}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesPage
              employees={employees}
              loading={loading}
              onRefresh={() => loadData()}
              initialRiskFilter={employeeRiskFilter}
              onSelectEmployeeForPredict={(emp) => {
                setCurrentTab('predict');
              }}
            />
          )}

          {currentTab === 'history' && <HistoryPage />}

          {currentTab === 'analytics' && (
            <AnalyticsPage summary={summary} employees={employees} />
          )}

          {currentTab === 'model-info' && <ModelInfoPage metadata={metadata} />}
        </main>
      </div>
    </div>
  );
}
