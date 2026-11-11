import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, ExternalLink, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-sm mt-16 border-t border-slate-800">
      {/* Top Disclaimer bar */}
      <div className="bg-slate-950 py-4 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>WhiteMatrix Assessment Notice:</strong> This is a recruitment engineering prototype. Fictional sample data only. Not affiliated with or endorsed by the Government of Kerala.
            </span>
          </div>
          <div>
            Built with React, Express, PostgreSQL, and Gemini AI Assistant.
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-base mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-300">
              <Shield className="w-4 h-4" />
            </div>
            CMO Public Grievance Cell
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            An integrated, AI-assisted public grievance redressal portal enabling transparent, time-bound governance and accountability across all 14 districts of Kerala.
          </p>
          <div className="text-xs text-emerald-400 font-medium">
            Citizen Charter SLA: High (3d) | Med (7d) | Low (14d)
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
            Citizen Services
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/submit" className="hover:text-white transition">
                Submit New Grievance
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-white transition">
                Track Application Status
              </Link>
            </li>
            <li>
              <Link to="/departments" className="hover:text-white transition">
                12 Participating Departments
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-white transition">
                Workflow & Escalation SLA
              </Link>
            </li>
            <li>
              <Link to="/citizen" className="hover:text-white transition">
                Citizen Self-Service Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
            Administration
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/cmo" className="hover:text-white transition">
                CMO Monitoring Dashboard
              </Link>
            </li>
            <li>
              <Link to="/officer" className="hover:text-white transition">
                Department Officer Portal
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Governance Vision
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white transition">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Public Secretariat Helpdesk
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
            Secretariat Contact (Simulated)
          </h4>
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Public Grievance Redressal Cell, Secretariat, Thiruvananthapuram, Kerala - 695001</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Toll Free: 1800-425-7211 (09:00 AM - 06:00 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>grievance.cmo@kerala.gov.fake</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        © 2026 Chief Minister&apos;s Office Grievance Redressal Portal (Simulation for Assessment). All rights reserved.
      </div>
    </footer>
  );
};
