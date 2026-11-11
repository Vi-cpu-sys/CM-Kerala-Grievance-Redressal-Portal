import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Grievance } from '../types';
import {
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Send,
  X,
  FileCheck2,
  User,
  MapPin
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // ATR submission form
  const [atrReport, setAtrReport] = useState('');
  const [submittingAtr, setSubmittingAtr] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const res = await api.getGrievances({
        status: statusFilter,
        limit: 50
      });
      setGrievances(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'dept_officer') {
      navigate('/');
      return;
    }
    fetchGrievances();
  }, [isAuthenticated, role, statusFilter]);

  const openActionModal = async (id: number) => {
    setMessage('');
    setErrorMessage('');
    try {
      const res = await api.getGrievanceById(id);
      setSelectedGrievance(res.grievance);
      if (res.grievance.assignments && res.grievance.assignments[0]?.action_taken_report) {
        setAtrReport(res.grievance.assignments[0].action_taken_report);
      } else {
        setAtrReport('Field inspection was carried out on site. Corrective technical measures executed per standard departmental specifications.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load details');
    }
  };

  // Move status to In Progress
  const handleSetInProgress = async () => {
    if (!selectedGrievance) return;
    try {
      const res = await api.updateStatus(
        selectedGrievance.id,
        'In Progress',
        `Department field team mobilized for site verification by ${user?.name}.`
      );
      setSelectedGrievance(res.grievance);
      setMessage('Status updated to In Progress.');
      fetchGrievances();
    } catch (err: any) {
      setErrorMessage(err.message || 'Action failed');
    }
  };

  // Submit ATR
  const handleSubmitATR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance || !atrReport.trim()) return;
    setSubmittingAtr(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await api.submitActionReport(selectedGrievance.id, atrReport.trim());
      setSelectedGrievance(res.grievance);
      setMessage('Action Taken Report (ATR) submitted to CMO for final review and closure.');
      fetchGrievances();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit ATR');
    } finally {
      setSubmittingAtr(false);
    }
  };

  const total = grievances.length;
  const pending = grievances.filter(g => g.status !== 'Resolved').length;
  const overdue = grievances.filter(g => g.is_overdue).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-emerald-800/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            Department Field Redressal Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Designated Nodal Officer for Department #{user?.department_id} | Official Mail: {user?.email}
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-xs">
          <span className="text-slate-400 block">Department Jurisdiction:</span>
          <strong className="text-emerald-300 text-sm">Statewide Infrastructure Redressal</strong>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Department Cases
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{total}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Action / In Progress
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{pending}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            SLA Overdue
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{overdue}</div>
        </div>
      </div>

      {/* Assigned Grievances Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assigned Department Grievances</h2>
            <p className="text-xs text-slate-500">
              Execute field inspections, upload verified Action Taken Reports, and meet Citizen Charter SLA.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Cases</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Action Submitted">Action Submitted</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading department cases...</div>
        ) : grievances.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No grievances assigned under this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {grievances.map((g) => (
              <div
                key={g.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-3 rounded-xl transition"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {g.reference_no}
                    </span>
                    <StatusBadge status={g.status} size="sm" />
                    <PriorityBadge priority={g.priority} size="sm" />
                    <OverdueBadge isOverdue={g.is_overdue} escalated={g.escalated} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{g.subject}</h3>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>District: <strong>{g.district}</strong></span>
                    <span>•</span>
                    <span>Category: <strong>{g.category}</strong></span>
                    <span>•</span>
                    <span>SLA Due: <strong>{new Date(g.due_date).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openActionModal(g.id)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                  >
                    Action & Submit ATR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION TAKEN REPORT MODAL */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {selectedGrievance.reference_no}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  {selectedGrievance.subject}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <StatusBadge status={selectedGrievance.status} size="sm" />
                  <PriorityBadge priority={selectedGrievance.priority} size="sm" />
                  <OverdueBadge isOverdue={selectedGrievance.is_overdue} escalated={selectedGrievance.escalated} />
                </div>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Citizen Complaint & Location Details */}
            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-slate-600 uppercase tracking-wider block mb-1">
                  Citizen Statement & Site Description:
                </strong>
                <p className="text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedGrievance.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Location District</span>
                  <strong className="text-slate-900">{selectedGrievance.district}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">SLA Commitment</span>
                  <strong className="text-slate-900">{selectedGrievance.priority} Priority</strong>
                </div>
              </div>

              {/* Attachments if any */}
              {selectedGrievance.attachments && selectedGrievance.attachments.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <strong className="text-slate-700 uppercase tracking-wider block text-[11px]">
                    Citizen Attached Site Photos / Evidence:
                  </strong>
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

              {/* CMO Assignment Instructions */}
              {selectedGrievance.assignments && selectedGrievance.assignments[0]?.instructions && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-1">
                  <strong className="text-indigo-950 font-bold block">
                    Chief Minister&apos;s Office Directive:
                  </strong>
                  <p className="text-indigo-900">
                    {selectedGrievance.assignments[0].instructions}
                  </p>
                </div>
              )}
            </div>

            {/* ACTION CONTROLS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">
                Department Field Actions
              </h3>

              {/* Move to In Progress if currently Under Review */}
              {selectedGrievance.status === 'Under Review' && (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <strong className="text-slate-900 block">Acknowledge & Mobilize Team</strong>
                    <span className="text-slate-500">Mark case as &apos;In Progress&apos; while field inspection takes place.</span>
                  </div>
                  <button
                    onClick={handleSetInProgress}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Start In Progress
                  </button>
                </div>
              )}

              {/* Submit Action Taken Report (ATR) Form */}
              <form onSubmit={handleSubmitATR} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  Submit Official Action Taken Report (ATR)
                </div>
                <p className="text-slate-500 text-xs">
                  Describe the physical repair, administrative order, or corrective sanction implemented to resolve this citizen grievance.
                </p>

                <textarea
                  required
                  rows={4}
                  value={atrReport}
                  onChange={(e) => setAtrReport(e.target.value)}
                  placeholder="e.g. Conducted site inspection at MG Road. Potholes patched using heavy-duty cold bituminous mix. Work inspected and verified."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Status will transition to <strong>Action Submitted</strong> for CMO review.
                  </span>
                  <button
                    type="submit"
                    disabled={submittingAtr}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingAtr ? 'Submitting ATR...' : 'Submit ATR to CMO'}
                  </button>
                </div>
              </form>
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedGrievance(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
