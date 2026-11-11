import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Department, Grievance, GrievancePriority, GrievanceStatus } from '../types';
import { generateGrievancePDF } from '../utils/pdfReport';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Users,
  Building,
  ArrowRight,
  TrendingUp,
  X,
  Send,
  MessageSquare,
  Sparkles,
  Download,
  RotateCcw
} from 'lucide-react';

export const CMODashboard: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Grievances Table
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Grievance Modal
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal Action Form States
  const [assignDeptId, setAssignDeptId] = useState<number>(1);
  const [assignInstructions, setAssignInstructions] = useState('');
  const [internalRemarkInput, setInternalRemarkInput] = useState('');
  const [escalateReason, setEscalateReason] = useState('Resolution exceeded Citizen Charter SLA period.');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadReport = async () => {
    setIsGeneratingPdf(true);
    try {
      // Fetch full set of matching grievances up to 100 items for the comprehensive report
      const res = await api.getGrievances({
        status: statusFilter,
        district: districtFilter,
        priority: priorityFilter,
        search,
        overdue: overdueOnly,
        page: 1,
        limit: 100
      });

      const reportItems = res.items && res.items.length > 0 ? res.items : grievances;

      if (reportItems.length === 0) {
        setActionError('No grievances match the current filter criteria to generate a report.');
        return;
      }

      const doc = generateGrievancePDF(reportItems, {
        statusFilter,
        districtFilter,
        priorityFilter,
        overdueOnly,
        search,
        generatedBy: user?.name
      });

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`CMO_Kerala_Grievances_Report_${dateStr}.pdf`);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      if (grievances.length > 0) {
        const doc = generateGrievancePDF(grievances, {
          statusFilter,
          districtFilter,
          priorityFilter,
          overdueOnly,
          search,
          generatedBy: user?.name
        });
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`CMO_Kerala_Grievances_Report_${dateStr}.pdf`);
      } else {
        setActionError(err.message || 'Failed to generate PDF report');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getCmoStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTable = async () => {
    setTableLoading(true);
    try {
      const res = await api.getGrievances({
        status: statusFilter,
        district: districtFilter,
        priority: priorityFilter,
        search,
        overdue: overdueOnly,
        page,
        limit: 15
      });
      setGrievances(res.items);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'cmo_admin') {
      navigate('/');
      return;
    }

    api.getDepartments().then(res => setDepartments(res.departments));
    api.getDistricts().then(res => setDistricts(res.districts));
    fetchStats();
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (isAuthenticated && role === 'cmo_admin') {
      fetchTable();
    }
  }, [statusFilter, districtFilter, priorityFilter, overdueOnly, page, search]);

  const openGrievanceModal = async (id: number) => {
    setModalLoading(true);
    setActionSuccessMessage('');
    setActionError('');
    try {
      const res = await api.getGrievanceById(id);
      setSelectedGrievance(res.grievance);
      if (res.grievance.department_id) {
        setAssignDeptId(res.grievance.department_id);
      } else if (res.grievance.ai_suggested_department_id) {
        setAssignDeptId(res.grievance.ai_suggested_department_id);
      }
      setAssignInstructions('Immediate site inspection and Action Taken Report required within SLA.');
      setInternalRemarkInput('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to open grievance');
    } finally {
      setModalLoading(false);
    }
  };

  // Actions
  const handleMoveToUnderReview = async () => {
    if (!selectedGrievance) return;
    try {
      const res = await api.updateStatus(
        selectedGrievance.id,
        'Under Review',
        'CMO Public Cell opened case for triage assessment.'
      );
      setSelectedGrievance(res.grievance);
      setActionSuccessMessage('Grievance status moved to Under Review.');
      fetchTable();
      fetchStats();
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    }
  };

  const handleAssignDepartment = async () => {
    if (!selectedGrievance) return;
    try {
      const res = await api.assignGrievance(
        selectedGrievance.id,
        assignDeptId,
        null,
        assignInstructions
      );
      setSelectedGrievance(res.grievance);
      setActionSuccessMessage('Assigned to department. Status is now In Progress.');
      fetchTable();
      fetchStats();
    } catch (err: any) {
      setActionError(err.message || 'Assignment failed');
    }
  };

  const handleEscalate = async () => {
    if (!selectedGrievance) return;
    try {
      const res = await api.escalateGrievance(selectedGrievance.id, escalateReason);
      setSelectedGrievance(res.grievance);
      setActionSuccessMessage('Grievance priority escalated by CMO.');
      fetchTable();
      fetchStats();
    } catch (err: any) {
      setActionError(err.message || 'Escalation failed');
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedGrievance) return;
    try {
      const res = await api.updateStatus(
        selectedGrievance.id,
        'Resolved',
        'Action Taken Report verified and approved by CMO Public Cell.'
      );
      setSelectedGrievance(res.grievance);
      setActionSuccessMessage('Grievance marked as Resolved.');
      fetchTable();
      fetchStats();
    } catch (err: any) {
      setActionError(err.message || 'Resolution failed');
    }
  };

  const handleAddInternalRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance || !internalRemarkInput.trim()) return;
    try {
      await api.addInternalRemark(selectedGrievance.id, internalRemarkInput.trim());
      const updated = await api.getGrievanceById(selectedGrievance.id);
      setSelectedGrievance(updated.grievance);
      setInternalRemarkInput('');
      setActionSuccessMessage('Confidential internal remark added.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to add remark');
    }
  };

  // Chart Color Palette
  const STATUS_COLORS: Record<string, string> = {
    'Submitted': '#f59e0b',
    'Under Review': '#3b82f6',
    'In Progress': '#6366f1',
    'Action Submitted': '#a855f7',
    'Resolved': '#10b981'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Executive Oversight Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chief Minister&apos;s Public Grievance Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Logged in as <strong>{user?.name}</strong> (Principal Secretary to Chief Minister)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadReport}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
            title="Generate and download printable PDF report of current filtered grievance list"
          >
            <Download className="w-3.5 h-3.5" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Download Report'}
          </button>
          <button
            onClick={() => {
              fetchStats();
              fetchTable();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            Refresh Real-Time Data
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Grievances
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.kpi.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Across 14 Districts</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending / In Progress
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 mt-1">
              {stats.kpi.pending}
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-1">Active Department Triage</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Successfully Resolved
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {stats.kpi.resolved}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {stats.kpi.resolutionRate}% Efficiency
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              SLA Overdue
            </div>
            <div className="text-3xl font-extrabold text-rose-600 mt-1">
              {stats.kpi.overdue}
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">Requires Direct Escalation</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              CMO Escalated
            </div>
            <div className="text-3xl font-extrabold text-purple-700 mt-1">
              {stats.kpi.escalated}
            </div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">Under Priority Orders</div>
          </div>
        </div>
      )}

      {/* ANALYTICS CHARTS SECTION (RECHARTS) */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: District-wise Grievances */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>District-Wise Grievance Distribution</span>
              <span className="text-xs font-normal text-slate-400">All 14 Districts</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.districtWise}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="district" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#047857" radius={[4, 4, 0, 0]} name="Grievances" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status Split Donut */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Current Status Lifecycle Breakdown</span>
              <span className="text-xs font-normal text-slate-400">Real-Time State Machine</span>
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusSplit}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    label={(entry: any) => `${entry.name}: ${entry.value || entry.count}`}
                  >
                    {stats.statusSplit.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Department Workload & Resolution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Department Workload vs Resolved</span>
              <span className="text-xs font-normal text-slate-400">12 Integrated Departments</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentWise}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={65} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#4f46e5" name="Total Assigned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Monthly Redressal Trend */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Monthly Inflow & Resolution Velocity</span>
              <span className="text-xs font-normal text-slate-400">Historical Comparison</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="submitted" stroke="#f59e0b" strokeWidth={2} name="Received" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} name="Resolved" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MASTER GRIEVANCES TABLE & FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Master Grievances Registry</h2>
            <p className="text-xs text-slate-500">Supervise, assign departments, escalate overdue cases, and enforce citizen resolution.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, subject, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <div>
            <span className="text-slate-500 mr-1.5 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Action Submitted">Action Submitted</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <span className="text-slate-500 mr-1.5 font-medium">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All 14 Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-slate-500 mr-1.5 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {(statusFilter !== 'all' || districtFilter !== 'all' || priorityFilter !== 'all' || overdueOnly || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setDistrictFilter('all');
                setPriorityFilter('all');
                setOverdueOnly(false);
                setSearch('');
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs flex items-center gap-1 transition"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="overdue-filter"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <label htmlFor="overdue-filter" className="font-bold text-rose-700 cursor-pointer">
                Show SLA Overdue Only
              </label>
            </div>

            <button
              onClick={handleDownloadReport}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              title="Generate and download printable PDF report of current filtered grievance list"
            >
              <Download className="w-3.5 h-3.5" />
              {isGeneratingPdf ? 'Generating PDF...' : 'Download Report'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Reference No</th>
                <th className="py-3 px-3">Citizen</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Assigned Dept</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">SLA Due</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Loading grievances registry...
                  </td>
                </tr>
              ) : grievances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No matching grievances found.
                  </td>
                </tr>
              ) : (
                grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {g.reference_no}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{g.citizen_name || 'Citizen'}</div>
                      <div className="text-[10px] text-slate-400">{g.citizen_mobile}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{g.district}</td>
                    <td className="py-3 px-3 max-w-xs truncate font-medium text-slate-900" title={g.subject}>
                      {g.subject}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {g.department_name || g.ai_suggested_department_name || (
                        <span className="text-amber-700 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={g.priority} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={g.status} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-600">
                        {new Date(g.due_date).toLocaleDateString()}
                      </div>
                      <OverdueBadge isOverdue={g.is_overdue} escalated={g.escalated} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openGrievanceModal(g.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-[11px] transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div>Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MASTER MANAGEMENT MODAL (CMO) */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-slate-800">
                    {selectedGrievance.reference_no}
                  </span>
                  <StatusBadge status={selectedGrievance.status} size="sm" />
                  <PriorityBadge priority={selectedGrievance.priority} size="sm" />
                  <OverdueBadge isOverdue={selectedGrievance.is_overdue} escalated={selectedGrievance.escalated} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedGrievance.subject}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
                  <span>Citizen: <strong>{selectedGrievance.citizen_name}</strong></span>
                  <span>Mobile: <strong>{selectedGrievance.citizen_mobile}</strong></span>
                  <span>District: <strong>{selectedGrievance.district}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Feedback Alerts */}
            {actionSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
            )}
            {actionError && (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Full Complaint Description & AI Analysis Box */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Citizen Complaint Statement:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedGrievance.description}
                </p>
              </div>

              {/* Attachments if any */}
              {selectedGrievance.attachments && selectedGrievance.attachments.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <span className="font-semibold text-slate-700 block">Uploaded Supporting Documents / Site Photos:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedGrievance.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={api.getAttachmentUrl(att.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-mono text-[11px] transition shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{att.filename} ({Math.round(att.size / 1024)} KB)</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendation Summary */}
              {selectedGrievance.ai_summary && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      AI Triage Summary & Recommendations
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
                      {selectedGrievance.ai_provider || 'Gemini 2.5 Flash'}
                    </span>
                  </div>
                  <p className="text-slate-700 italic">
                    &ldquo;{selectedGrievance.ai_summary}&rdquo;
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div>AI Category: <strong>{selectedGrievance.ai_category}</strong></div>
                    <div>AI Priority: <strong>{selectedGrievance.ai_priority}</strong></div>
                    <div>AI Dept: <strong>{selectedGrievance.ai_suggested_department_name}</strong></div>
                  </div>
                </div>
              )}

              {/* Action Taken Report (ATR) from Officer */}
              {selectedGrievance.assignments && selectedGrievance.assignments[0]?.action_taken_report && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-700" />
                    Department Action Taken Report (ATR)
                  </div>
                  <p className="text-purple-900 leading-relaxed bg-white/70 p-3 rounded-lg border border-purple-100">
                    {selectedGrievance.assignments[0].action_taken_report}
                  </p>
                  <div className="text-[11px] text-purple-800">
                    Submitted by: <strong>{selectedGrievance.assignments[0].officer_name || 'Designated Officer'}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* CMO ACTION BUTTONS & WORKFLOW CONTROLS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">
                Chief Minister&apos;s Office Directive Controls
              </h3>

              {/* 1. If Submitted: Move to Under Review */}
              {selectedGrievance.status === 'Submitted' && (
                <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <strong className="text-slate-900 block">Step 1: Open Triage Review</strong>
                    <span className="text-slate-500">Verify jurisdiction and change status to &apos;Under Review&apos;.</span>
                  </div>
                  <button
                    onClick={handleMoveToUnderReview}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Set Under Review
                  </button>
                </div>
              )}

              {/* 2. Assign Department & Officer */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">
                  Forward / Assign Department & Direct Action:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Select Department *</label>
                    <select
                      value={assignDeptId}
                      onChange={(e) => setAssignDeptId(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Executive Instructions *</label>
                    <input
                      type="text"
                      value={assignInstructions}
                      onChange={(e) => setAssignInstructions(e.target.value)}
                      placeholder="e.g. Inspect site immediately and submit ATR."
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAssignDepartment}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Forward to Department (Set In Progress)
                </button>
              </div>

              {/* 3. Escalate Overdue Grievance */}
              {selectedGrievance.status !== 'Resolved' && (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong className="text-rose-700 block">CMO Direct Escalation</strong>
                    <span className="text-slate-500">Flag priority escalation for overdue SLA turnaround.</span>
                  </div>
                  <button
                    onClick={handleEscalate}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm shrink-0"
                  >
                    Escalate Priority
                  </button>
                </div>
              )}

              {/* 4. Mark as Resolved */}
              {['In Progress', 'Action Submitted', 'Under Review'].includes(selectedGrievance.status) && (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong className="text-emerald-800 block">Finalize Case Resolution</strong>
                    <span className="text-slate-500">Approve department action and mark grievance as Resolved.</span>
                  </div>
                  <button
                    onClick={handleMarkResolved}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm shrink-0"
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}

              {/* 5. Internal Confidential Remark (CMO Only) */}
              <form onSubmit={handleAddInternalRemark} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  Add Confidential Internal Remark (CMO Visibility Only):
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={internalRemarkInput}
                    onChange={(e) => setInternalRemarkInput(e.target.value)}
                    placeholder="Enter confidential ministerial observation..."
                    className="flex-1 p-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold shrink-0"
                  >
                    Save Remark
                  </button>
                </div>

                {selectedGrievance.internal_remarks && selectedGrievance.internal_remarks.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {selectedGrievance.internal_remarks.map((r) => (
                      <div key={r.id} className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                        <span className="font-semibold text-slate-800">{r.author_name}:</span> {r.remark}
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Audit Trail */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Official Audit Trail:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedGrievance.history?.map((h, i) => (
                  <div key={i} className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200 flex justify-between gap-2">
                    <div>
                      <strong className="text-slate-900">{h.to_status}</strong>: {h.remark}
                      <span className="text-slate-400 block text-[10px]">By: {h.changed_by_name} ({h.changed_by_role})</span>
                    </div>
                    <span className="text-slate-400 font-mono shrink-0">
                      {new Date(h.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedGrievance(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
