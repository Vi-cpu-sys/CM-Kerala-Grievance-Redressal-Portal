import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Grievance } from '../types';
import {
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Search,
  ExternalLink,
  Star,
  RefreshCw,
  AlertCircle,
  X,
  MessageSquare
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // Feedback / Reopen states
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenRequested, setReopenRequested] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

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
    fetchGrievances();
  }, [isAuthenticated, statusFilter]);

  const openDetail = async (id: number) => {
    try {
      const res = await api.getGrievanceById(id);
      setSelectedGrievance(res.grievance);
      if (res.grievance.feedback) {
        setRating(res.grievance.feedback.rating);
        setFeedbackComment(res.grievance.feedback.comment || '');
      } else {
        setRating(5);
        setFeedbackComment('');
      }
      setReopenRequested(false);
      setFeedbackMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    setFeedbackSubmitting(true);
    try {
      const res = await api.submitFeedback(
        selectedGrievance.id,
        rating,
        feedbackComment,
        reopenRequested
      );
      setSelectedGrievance(res.grievance);
      setFeedbackMessage(res.message);
      fetchGrievances();
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Feedback submission failed');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const total = grievances.length;
  const resolved = grievances.filter(g => g.status === 'Resolved').length;
  const pending = total - resolved;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-emerald-800/40">
        <div>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Citizen Self-Service Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Registered Email: {user?.email} | Mobile: {user?.mobile}
          </p>
        </div>

        <Link
          to="/submit"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md flex items-center gap-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          File New Grievance
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Grievances Filed
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{total}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active / Under Review
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{pending}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Resolved by CMO
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{resolved}</div>
        </div>
      </div>

      {/* Grievances List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Registered Grievances</h2>
            <p className="text-xs text-slate-500">Track and review all grievances submitted under your account.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Action Submitted">Action Submitted</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading your grievances...</div>
        ) : grievances.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No grievances found in this status.</p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> File a grievance now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {grievances.map((g) => (
              <div
                key={g.id}
                onClick={() => openDetail(g.id)}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-3 rounded-xl transition cursor-pointer"
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
                    <span>Department: <strong>{g.department_name || g.ai_suggested_department_name || 'Triage'}</strong></span>
                    <span>•</span>
                    <span>Filed: {new Date(g.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(g.id);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                  >
                    View Details & ATR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL & FEEDBACK MODAL */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedGrievance.reference_no}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
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

            {/* Complaint details */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Full Grievance Statement:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1 leading-relaxed">
                  {selectedGrievance.description}
                </p>
              </div>

              {selectedGrievance.ai_summary && (
                <div className="text-xs bg-emerald-50/50 border border-emerald-200 rounded-xl p-3">
                  <strong className="text-emerald-950 block mb-0.5">AI Executive Summary:</strong>
                  <span className="text-emerald-900">{selectedGrievance.ai_summary}</span>
                </div>
              )}

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
                        <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Taken Report (ATR) if available */}
              {selectedGrievance.assignments && selectedGrievance.assignments[0]?.action_taken_report && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-1 text-xs">
                  <strong className="text-purple-950 font-bold block">
                    Official Action Taken Report (ATR) by Department:
                  </strong>
                  <p className="text-purple-900 leading-relaxed">
                    {selectedGrievance.assignments[0].action_taken_report}
                  </p>
                  <div className="text-[11px] text-purple-700 pt-1">
                    Submitted by: {selectedGrievance.assignments[0].officer_name || 'Designated Officer'}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Status Timeline:
                </span>
                <div className="space-y-2">
                  {selectedGrievance.history?.map((h, i) => (
                    <div key={i} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-900">{h.to_status}</span>
                        {h.remark && <p className="text-slate-600 mt-0.5">{h.remark}</p>}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FEEDBACK & REOPEN SECTION (Active if grievance is Resolved) */}
            {selectedGrievance.status === 'Resolved' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Citizen Satisfaction & Reopen Option
                  </h3>
                  {selectedGrievance.feedback && (
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                      Feedback Submitted
                    </span>
                  )}
                </div>

                {feedbackMessage && (
                  <div className="text-xs text-emerald-800 bg-emerald-100 p-2 rounded border border-emerald-300">
                    {feedbackMessage}
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Rate the Redressal Quality (1 to 5 Stars):
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-slate-700">{rating} out of 5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Citizen Remarks / Reason if Reopening:
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Comment on whether the issue was resolved properly..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  {/* REOPEN TOGGLE */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="reopen-check"
                      checked={reopenRequested}
                      onChange={(e) => setReopenRequested(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <label htmlFor="reopen-check" className="text-xs font-bold text-rose-700 cursor-pointer">
                      Request REOPEN (The physical problem was not resolved by the department)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50"
                  >
                    {feedbackSubmitting
                      ? 'Submitting...'
                      : reopenRequested
                      ? 'Submit Feedback & Reopen Grievance'
                      : 'Submit Rating & Feedback'}
                  </button>
                </form>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Link
                to={`/track?ref=${encodeURIComponent(selectedGrievance.reference_no)}`}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1.5 border border-emerald-200 transition"
              >
                <Search className="w-3.5 h-3.5 text-emerald-700" />
                Track in Public Portal
              </Link>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
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
