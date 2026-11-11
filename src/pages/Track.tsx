import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { Grievance } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Building,
  Calendar,
  FileText,
  UserCheck,
  Copy,
  Check,
  Printer
} from 'lucide-react';

export const Track: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const [refInput, setRefInput] = useState(initialRef);
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const copyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeTrack = async (refNo: string) => {
    if (!refNo.trim()) return;
    setLoading(true);
    setError('');
    setGrievance(null);

    try {
      const res = await api.trackGrievance(refNo);
      setGrievance(res.tracking);
    } catch (err: any) {
      setError(err.message || 'Grievance not found. Please verify reference ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      executeTrack(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refInput.trim()) {
      setSearchParams({ ref: refInput.trim() });
      executeTrack(refInput.trim());
    }
  };

  const sampleRefs = ['CMK-2026-000101', 'CMK-2026-000102', 'CMK-2026-000103', 'CMK-2026-000104'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Public Grievance Tracking Portal
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Enter your official reference number to view real-time department assignment, field inspection reports, and resolution timeline.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. CMK-2026-000101"
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition shrink-0 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Track Grievance'}
          </button>
        </form>

        {/* Sample Quick Links */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Click sample reference to test:</span>
          {sampleRefs.map((ref) => (
            <button
              key={ref}
              type="button"
              onClick={() => {
                setRefInput(ref);
                setSearchParams({ ref });
                executeTrack(ref);
              }}
              className="font-mono text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
            >
              {ref}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Citizen Privacy Protected:</strong> Public tracking displays grievance status, timeline, and department remarks. Citizen name, phone number, email, and internal remarks are withheld to safeguard privacy.
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Grievance Not Found</h3>
            <p className="text-xs text-rose-800">{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {grievance && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Grievance Reference Number
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {grievance.reference_no}
                </span>
                <button
                  type="button"
                  onClick={() => copyRef(grievance.reference_no)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Copy Reference Number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                {copied && <span className="text-xs text-emerald-600 font-semibold">Copied!</span>}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>District: <strong>{grievance.district}</strong></span>
                <span>•</span>
                <span>Category: <strong>{grievance.category}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={grievance.status} size="md" />
              <PriorityBadge priority={grievance.priority} size="md" />
              <OverdueBadge isOverdue={grievance.is_overdue} escalated={grievance.escalated} />
              <button
                type="button"
                onClick={() => window.print()}
                className="ml-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 transition"
                title="Print official tracking docket"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Record
              </button>
            </div>
          </div>

          {/* Core Content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {grievance.subject}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {grievance.description}
              </p>
            </div>

            {/* Department info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-950">Assigned Department</div>
                  <div className="text-emerald-800 mt-0.5">
                    {grievance.department_name || 'Under Review by CMO Public Cell'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">SLA Due Date</div>
                  <div className="text-slate-600 mt-0.5">
                    {new Date(grievance.due_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    {grievance.is_overdue && (
                      <span className="ml-1 text-red-600 font-semibold">(Overdue)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              Redressal Status History & Milestone Audit Trail
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {grievance.history?.map((h, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-600 shadow" />
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={h.to_status} size="sm" />
                        <span className="text-xs font-semibold text-slate-700">
                          by {h.changed_by_role === 'cmo_admin' ? 'Chief Minister’s Office' : h.changed_by_role === 'dept_officer' ? 'Department Official' : 'Citizen'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(h.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {h.remark && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {h.remark}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
