import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the CMO Public Grievance Redressal Portal?',
      a: 'The CMO Public Grievance Redressal Portal is a centralized government web platform that allows citizens across all 14 districts of Kerala to submit grievances directly to the Chief Minister’s Office. The portal tracks every complaint through a strict, transparent state machine and ensures time-bound resolution by assigned department officials.'
    },
    {
      q: 'How does the AI Grievance Assistant work and is my private data safe?',
      a: 'When you type your grievance description, our AI Grievance Assistant analyzes the text to determine the responsible department, appropriate category, priority level, and a concise 40-word summary. Before sending text to the AI model, all Personally Identifiable Information (PII) including phone numbers, emails, and identity identifiers are strictly redacted. If the AI model is offline or times out, the portal automatically fails over to an internal keyword classifier with zero service disruption.'
    },
    {
      q: 'What is the Duplicate Grievance Alert?',
      a: 'To prevent duplicate work and administrative backlog, our system compares your grievance description against existing open grievances in your district and category using text similarity algorithms. If similar issues have already been reported nearby, the portal flags them for your review. The system never auto-rejects complaints; citizens retain full authority to proceed with submission.'
    },
    {
      q: 'What are the Service Level Agreements (SLA) for resolving complaints?',
      a: 'Every complaint is assigned a priority SLA: High Priority issues (such as dangling power cables or burst drinking water mains) have an SLA of 3 days (72 hours); Medium Priority issues (potholes, crop compensation, municipal waste) have an SLA of 7 days; Low Priority issues have an SLA of 14 days. If a complaint is not resolved within the SLA, it is automatically marked as "SLA Overdue" and highlighted on the CMO Admin dashboard for immediate escalation.'
    },
    {
      q: 'Can anyone track my grievance, and will they see my personal details?',
      a: 'Anyone with your official reference number (e.g. CMK-2026-000101) can track the public progress timeline and assigned department. However, for citizen privacy, the public tracking view strictly strips all personal data (your name, mobile number, email, and internal CMO remarks are completely inaccessible to public viewers).'
    },
    {
      q: 'What should I do if the department marks my grievance resolved but the issue persists?',
      a: 'If a grievance is marked as "Resolved" by the CMO but the physical remedy on the ground was incomplete or unsatisfactory, citizens can log into their dashboard and click "Request Reopen" on the grievance detail page. Submitting feedback with the reopen request automatically reverts the state machine to "Under Review", mandating a supervisory re-investigation by the CMO.'
    },
    {
      q: 'What file attachments are supported and what is the maximum size?',
      a: 'The portal accepts JPEG, PNG, and PDF files up to 2 MB in size. Files are securely stored as binary data within the database and served exclusively through authenticated, role-authorized endpoints.'
    },
    {
      q: 'Which government departments are currently integrated into the portal?',
      a: '12 core departments are integrated: Public Works Department (PWD), Health & Family Welfare, General Education, Kerala State Electricity Board (KSEB), Kerala Water Authority (KWA), Local Self Government (LSGD), Revenue & Land Records, Kerala Police, Transport & KSRTC, Agriculture Development & Farmers Welfare, Social Justice, and Food & Civil Supplies.'
    },
    {
      q: 'How do I obtain the reference number for tracking my complaint?',
      a: 'Immediately upon successful submission, a unique reference number formatted as "CMK-2026-XXXXXX" is displayed on your screen along with a one-click copy button. It is also saved in your Citizen Dashboard under "My Grievances".'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          Help & Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Common queries regarding grievance registration, tracking, artificial intelligence safeguards, and citizen rights.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
