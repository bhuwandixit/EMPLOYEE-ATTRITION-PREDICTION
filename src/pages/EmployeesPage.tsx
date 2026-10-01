import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Employee } from '../types';
import { api } from '../services/api';

interface EmployeesPageProps {
  employees: Employee[];
  loading: boolean;
  onRefresh: () => void;
  onSelectEmployeeForPredict?: (emp: Employee) => void;
  initialRiskFilter?: string;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  employees,
  loading,
  onRefresh,
  onSelectEmployeeForPredict,
  initialRiskFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState(initialRiskFilter || 'All');
  const [sortBy, setSortBy] = useState<'name' | 'monthly_income' | 'years_at_company' | 'probability'>('probability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  // New Employee Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpData, setNewEmpData] = useState<Partial<Employee>>({
    employee_id: `EMP-${1000 + Math.floor(Math.random() * 9000)}`,
    name: '',
    department: 'Research & Development',
    job_role: 'Research Scientist',
    age: 32,
    monthly_income: 5000,
    years_at_company: 3,
    overtime: 'No',
    business_travel: 'Travel_Rarely',
    job_satisfaction: 3,
    work_life_balance: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  // Client filtering & sorting
  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesRisk = riskFilter === 'All' || emp.attrition_risk.toLowerCase() === riskFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesRisk;
  });

  filtered.sort((a, b) => {
    let va = a[sortBy];
    let vb = b[sortBy];
    if (typeof va === 'string') {
      return sortOrder === 'desc' ? (vb as string).localeCompare(va as string) : (va as string).localeCompare(vb as string);
    }
    return sortOrder === 'desc' ? (vb as number) - (va as number) : (va as number) - (vb as number);
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this employee from the roster?')) {
      try {
        await api.deleteEmployee(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete employee');
      }
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpData.name) {
      alert('Please provide an employee name');
      return;
    }
    setSubmitting(true);
    try {
      await api.createEmployee(newEmpData);
      setIsAddModalOpen(false);
      onRefresh();
      setNewEmpData({
        employee_id: `EMP-${1000 + Math.floor(Math.random() * 9000)}`,
        name: '',
        department: 'Research & Development',
        job_role: 'Research Scientist',
        age: 32,
        monthly_income: 5000,
        years_at_company: 3,
        overtime: 'No',
      });
    } catch (err: any) {
      alert(err.message || 'Error creating employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Action Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID or role..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="All">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Research & Development">Research & Development</option>
            <option value="Human Resources">Human Resources</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>

          {/* Add Employee Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Main Employee Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Role</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                  onClick={() => {
                    if (sortBy === 'monthly_income') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('monthly_income');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Monthly Salary</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                  onClick={() => {
                    if (sortBy === 'years_at_company') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('years_at_company');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Tenure</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">OverTime</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                  onClick={() => {
                    if (sortBy === 'probability') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('probability');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Attrition Risk</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Loading employee roster...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No employees matching the current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee Name & ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{emp.employee_id} · {emp.age}yo</div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{emp.job_role}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>

                    {/* Salary */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      ${emp.monthly_income.toLocaleString()}
                    </td>

                    {/* Tenure */}
                    <td className="py-3 px-4">
                      <div>{emp.years_at_company} yrs</div>
                      <div className="text-[10px] text-slate-400">
                        WLB: {emp.work_life_balance}/4 · Sat: {emp.job_satisfaction}/4
                      </div>
                    </td>

                    {/* Overtime */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          emp.overtime === 'Yes' ? 'text-red-600' : 'text-slate-500'
                        }`}
                      >
                        {emp.overtime}
                      </span>
                    </td>

                    {/* Risk Tier & Probability */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            emp.attrition_risk === 'High'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : emp.attrition_risk === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {emp.attrition_risk === 'High' ? (
                            <ShieldAlert className="h-3 w-3" />
                          ) : emp.attrition_risk === 'Medium' ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                          <span>{emp.attrition_risk}</span>
                        </span>
                        <span className="font-mono text-xs font-medium text-slate-800">
                          {(emp.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onSelectEmployeeForPredict && (
                          <button
                            onClick={() => onSelectEmployeeForPredict(emp)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Open in Predictor"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove Employee"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} employees
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-semibold text-slate-900">Enroll Employee in Roster</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Albright"
                  value={newEmpData.name}
                  onChange={(e) => setNewEmpData({ ...newEmpData, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={newEmpData.department}
                    onChange={(e) => setNewEmpData({ ...newEmpData, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Research & Development">Research & Development</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Job Role</label>
                  <select
                    value={newEmpData.job_role}
                    onChange={(e) => setNewEmpData({ ...newEmpData, job_role: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Research Scientist">Research Scientist</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Laboratory Technician">Laboratory Technician</option>
                    <option value="Sales Representative">Sales Representative</option>
                    <option value="Manufacturing Director">Manufacturing Director</option>
                    <option value="Healthcare Representative">Healthcare Representative</option>
                    <option value="Manager">Manager</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Monthly Salary ($)</label>
                  <input
                    type="number"
                    min="1000"
                    max="25000"
                    value={newEmpData.monthly_income}
                    onChange={(e) =>
                      setNewEmpData({ ...newEmpData, monthly_income: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Years at Company</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newEmpData.years_at_company}
                    onChange={(e) =>
                      setNewEmpData({ ...newEmpData, years_at_company: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Overtime Status</label>
                  <select
                    value={newEmpData.overtime}
                    onChange={(e) =>
                      setNewEmpData({ ...newEmpData, overtime: e.target.value as 'Yes' | 'No' })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="No">No Overtime</option>
                    <option value="Yes">Yes (Overtime)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={newEmpData.age}
                    onChange={(e) =>
                      setNewEmpData({ ...newEmpData, age: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
