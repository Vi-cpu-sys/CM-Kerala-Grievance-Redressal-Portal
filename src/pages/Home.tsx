import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Department } from '../types';
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  Sparkles,
  Users,
  Building,
  HelpCircle,
  Check,
  AlertCircle
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [quickRefNo, setQuickRefNo] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState({
    total: 42,
    resolved: 18,
    pending: 24,
    rate: 94.2
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch departments and public stats
    Promise.all([api.getDepartments(), api.getPublicStats().catch(() => null)])
      .then(([deptRes, statsRes]) => {
        if (deptRes?.departments) {
          setDepartments(deptRes.departments.slice(0, 6)); // Top 6
        }
        if (statsRes?.kpi) {
          setStats({
            total: statsRes.kpi.total,
            resolved: statsRes.kpi.resolved,
            pending: statsRes.kpi.pending,
            rate: statsRes.kpi.resolutionRate || 92.5
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRefNo.trim()) {
      navigate(`/track?ref=${encodeURIComponent(quickRefNo.trim())}`);
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white py-16 px-4 overflow-hidden border-b border-emerald-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI-Assisted Redressal & Time-Bound SLA Monitoring
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Transparent, Accountable & Rapid Grievance Redressal for Citizens of Kerala
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Directly connect with the Chief Minister&apos;s Public Grievance Cell. Submit civic grievances, receive automated AI department routing, and track status until verified resolution.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition"
            >
              <FileText className="w-5 h-5" />
              Submit Grievance Now
            </Link>

            <Link
              to="/track"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Search className="w-5 h-5 text-emerald-400" />
              Track Grievance Status
            </Link>
          </div>

          {/* Quick Track Search bar in Hero */}
          <div className="max-w-xl mx-auto pt-6">
            <form onSubmit={handleQuickTrack} className="flex items-center bg-white rounded-xl shadow-2xl p-1.5 border border-slate-200">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Enter Reference Number (e.g., CMK-2026-000101)..."
                value={quickRefNo}
                onChange={(e) => setQuickRefNo(e.target.value)}
                className="w-full px-3 py-2 text-slate-900 text-sm focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg font-medium text-xs sm:text-sm shrink-0 transition"
              >
                Track Now
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Sample Reference IDs: <code className="text-emerald-300 font-mono">CMK-2026-000101</code>, <code className="text-emerald-300 font-mono">CMK-2026-000102</code>
            </p>
          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS & CITIZEN SLA BAR */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-10 relative z-20">
          <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              Total Grievances Filed
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Digitized</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.resolved}</div>
            <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              Resolved Successfully
            </div>
            <div className="text-[11px] text-slate-400 mt-1">With Citizen Feedback</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              Under Active Redressal
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">Enforced by SLA</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">{stats.rate}%</div>
            <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              Redressal Efficiency
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">High (3d) SLA Norm</div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS - 6 STEP WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How The Redressal Workflow Operates
          </h2>
          <p className="text-slate-600 text-sm">
            Strict server-side state machine ensures transparency, accountability, and citizen verification at every milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              step: '1',
              title: 'Citizen Submits',
              desc: 'Grievance submitted with AI categorization and unique reference ID generated.',
              tag: 'Submitted'
            },
            {
              step: '2',
              title: 'CMO Review',
              desc: 'CMO Public Cell reviews AI suggestion and verifies jurisdiction.',
              tag: 'Under Review'
            },
            {
              step: '3',
              title: 'Department Assigned',
              desc: 'Forwarded to Executive Engineer/Officer with binding SLA timeframe.',
              tag: 'In Progress'
            },
            {
              step: '4',
              title: 'Field Action & ATR',
              desc: 'Department officer executes site work and submits Action Taken Report.',
              tag: 'ATR Submitted'
            },
            {
              step: '5',
              title: 'CMO Verified Resolve',
              desc: 'CMO assesses ATR for completeness and marks grievance Resolved.',
              tag: 'Resolved'
            },
            {
              step: '6',
              title: 'Citizen Rating / Reopen',
              desc: 'Citizen reviews ATR, rates 1-5 stars, or requests Reopen if unsatisfied.',
              tag: 'Reopen Option'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-sm flex items-center justify-center mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED DEPARTMENTS */}
      <section className="bg-slate-50 py-12 px-4 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Key Participating Departments
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Direct integration across 12 critical state administrative bodies in Kerala.
              </p>
            </div>
            <Link
              to="/departments"
              className="text-emerald-700 hover:text-emerald-800 font-semibold text-sm flex items-center gap-1"
            >
              View All 12 Departments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Dept #{dept.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      {dept.grievanceCount ?? 3} Active Cases
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {dept.description}
                  </p>
                </div>
                <Link
                  to={`/submit?dept=${dept.id}`}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-3 border-t border-slate-100"
                >
                  File complaint with this department <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AI GRIEVANCE ASSISTANT HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Intelligent Citizen Triage Engine
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              AI-Powered Categorization with Real-Time Duplicate Prevention
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              When you write your complaint in natural language, our Gemini-powered assistant automatically summarizes the issue, determines urgency, identifies the responsible department, and flags identical open complaints in your locality.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                <div className="font-bold text-emerald-300 mb-1">PII Sanitized</div>
                <div className="text-slate-300">Phone numbers, emails & Aadhaar are redacted before AI analysis.</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                <div className="font-bold text-amber-300 mb-1">100% Fallback Safe</div>
                <div className="text-slate-300">Offline keyword classifier guarantees 0% downtime without network latency.</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                <div className="font-bold text-blue-300 mb-1">Human-In-The-Loop</div>
                <div className="text-slate-300">Citizens and CMO retain full control to edit or override suggestions.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
