import React from 'react';
import { ArrowDown, Check, Clock, AlertTriangle, Shield, User, Building, FileCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Citizen Submission & AI Triage',
      status: 'Submitted',
      role: 'Citizen',
      sla: 'Immediate',
      desc: 'Citizen inputs district, subject, description, and optional JPEG/PNG/PDF attachment (up to 2 MB). The AI Grievance Assistant checks for duplicates, summarizes the issue in ≤40 words, recommends the appropriate department, and sets an initial priority. Citizen reviews and can accept or edit before final submission. A unique reference code (e.g. CMK-2026-000101) is assigned.',
      color: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      num: '02',
      title: 'CMO Public Cell Assessment',
      status: 'Under Review',
      role: 'CMO Admin',
      sla: 'Within 24 Hours',
      desc: 'Officers in the Chief Minister’s Public Cell review the complaint, inspect the AI summary, verify jurisdiction, and attach internal remarks. The status transitions to "Under Review".',
      color: 'bg-blue-100 text-blue-900 border-blue-300'
    },
    {
      num: '03',
      title: 'Department Forwarding & Assignment',
      status: 'In Progress',
      role: 'CMO Admin -> Department Officer',
      sla: 'SLA Clock Active',
      desc: 'CMO forwards the grievance to the competent department (e.g. PWD, KSEB, KWA) and designates a field officer with explicit directives. Status changes to "In Progress". If resolution is delayed past the SLA due date (High: 3d, Medium: 7d, Low: 14d), CMO can escalate the priority.',
      color: 'bg-indigo-100 text-indigo-900 border-indigo-300'
    },
    {
      num: '04',
      title: 'Field Verification & Action Taken Report (ATR)',
      status: 'Action Submitted',
      role: 'Department Officer',
      sla: 'Fieldwork Stage',
      desc: 'The assigned officer conducts on-site inspection, coordinates repair works, and uploads a signed Action Taken Report (ATR) documenting physical or administrative remedy. The status shifts to "Action Submitted".',
      color: 'bg-purple-100 text-purple-900 border-purple-300'
    },
    {
      num: '05',
      title: 'CMO Review & Case Resolution',
      status: 'Resolved',
      role: 'CMO Admin',
      sla: 'Final Redressal',
      desc: 'CMO Public Cell reviews the submitted ATR. If verified as satisfactory, the case is marked "Resolved". If incomplete, it is remanded back to "In Progress" with corrective orders.',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      num: '06',
      title: 'Citizen Feedback & Reopen Rights',
      status: 'Feedback / Under Review',
      role: 'Citizen',
      sla: 'Within 30 Days of Resolution',
      desc: 'Citizen is notified of resolution. The citizen rates redressal quality from 1 to 5 stars. If the grievance was not resolved on the ground, the citizen clicks "Request Reopen" with comments, moving the state machine back to "Under Review".',
      color: 'bg-rose-100 text-rose-900 border-rose-300'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Grievance Redressal Lifecycle & State Machine
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Every grievance is governed by a deterministic, server-enforced state machine ensuring accountability, role-based separation of concerns, and full auditability.
        </p>
      </div>

      {/* Step by step timeline */}
      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start gap-6 hover:border-emerald-500 transition"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-inner">
              {s.num}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
                  State: {s.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Role: {s.role}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Target SLA
              </div>
              <div className="text-sm font-bold text-emerald-700 flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {s.sla}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Matrix Table */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-6 shadow-xl">
        <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
          <Clock className="w-5 h-5" />
          Service Level Agreement (SLA) Charter
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">Maximum SLA Turnaround</th>
                <th className="py-3 px-4">Typical Grievance Examples</th>
                <th className="py-3 px-4">Escalation Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-rose-400">High Priority</td>
                <td className="py-3 px-4 font-semibold text-white">3 Days (72 Hours)</td>
                <td className="py-3 px-4">Dangling power lines, hospital medicine stockout, burst drinking main, bridge safety</td>
                <td className="py-3 px-4 text-rose-300">Automatic overdue flag; CMO direct escalation</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-amber-400">Medium Priority</td>
                <td className="py-3 px-4 font-semibold text-white">7 Days (1 Week)</td>
                <td className="py-3 px-4">Road potholes, school roof repairs, crop compensation, municipal waste accumulation</td>
                <td className="py-3 px-4 text-amber-300">Notice sent to District Collector & Dept Head</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-400">Low Priority</td>
                <td className="py-3 px-4 font-semibold text-white">14 Days (2 Weeks)</td>
                <td className="py-3 px-4">Bus stop shelter renovation, general street lighting schedule, administrative enquiries</td>
                <td className="py-3 px-4 text-slate-400">Review in fortnightly CMO departmental meeting</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
