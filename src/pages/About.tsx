import React from 'react';
import { Shield, Target, Compass, Eye, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          Governance Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About the Chief Minister&apos;s Public Grievance Redressal Portal
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Established to bridge citizens with government departments through an integrated, transparent, and technology-driven grievance management ecosystem.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-900 text-white rounded-2xl p-8 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="text-slate-200 text-sm leading-relaxed">
            To establish Kerala as a benchmark in participatory democracy where every citizen grievance is acknowledged within seconds, systematically investigated by designated authorities, and resolved within a binding Citizen Charter Service Level Agreement (SLA).
          </p>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-300">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-slate-200 text-sm leading-relaxed">
            To eliminate bureaucratic bottlenecks by deploying artificial intelligence for real-time triage, enforcing server-authoritative state machine transitions, and empowering citizens with transparent public tracking and reopening capabilities.
          </p>
        </div>
      </div>

      {/* Key Objectives */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-700" />
          Core Objectives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-1">Time-Bound Resolution (SLA)</strong>
              <span className="text-slate-600 text-xs leading-relaxed">
                High-priority issues addressed within 3 days; medium-priority within 7 days; low-priority within 14 days with automated escalation flags.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-1">Statewide Coverage Across 14 Districts</strong>
              <span className="text-slate-600 text-xs leading-relaxed">
                Unified grievance redressal encompassing all 14 districts from Kasaragod to Thiruvananthapuram with localized administrative jurisdiction.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-1">Responsible AI with Safeguards</strong>
              <span className="text-slate-600 text-xs leading-relaxed">
                Automatic PII scrubbing (phone numbers, emails, identity IDs) and guaranteed keyword fallback when LLM models are unavailable.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-1">Citizen Feedback & Reopen Rights</strong>
              <span className="text-slate-600 text-xs leading-relaxed">
                Citizens evaluate every resolved grievance with 1-5 star ratings and hold the fundamental right to trigger a case reopen if field action is incomplete.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recruitment Prototype Disclaimer Card */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 text-xs text-amber-900 space-y-2">
        <h3 className="font-bold text-amber-950 text-sm">Recruitment Assessment Notice</h3>
        <p className="leading-relaxed">
          This portal is an engineering prototype submitted as part of the technical evaluation for WhiteMatrix. All departments, officers, cases, and administrative communications represented within this system are simulated for demonstration purposes and do not represent actual government communications.
        </p>
      </div>
    </div>
  );
};
