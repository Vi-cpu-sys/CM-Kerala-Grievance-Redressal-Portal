import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoSwitcher } from './DemoSwitcher';
import {
  FileText,
  Search,
  Building,
  HelpCircle,
  PhoneCall,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  ChevronRight,
  Info
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* 1. MANDATORY RECRUITMENT DISCLAIMER BANNER */}
      <div className="bg-amber-500 text-slate-950 font-medium text-xs sm:text-sm py-1.5 px-4 text-center border-b border-amber-600 flex items-center justify-center gap-2">
        <Info className="w-4 h-4 shrink-0 text-slate-950" />
        <span>
          <strong>Recruitment prototype for WhiteMatrix assessment.</strong> Not affiliated with or endorsed by the Government of Kerala or the CMO.
        </span>
      </div>

      {/* 2. DEMO SWITCHER TOOLBAR */}
      <DemoSwitcher />

      {/* 3. MAIN EMBLEM & GOVERNMENT TITLE */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Fictional Government Stylized Emblem */}
            <div className="w-11 h-11 rounded-full bg-emerald-900 border-2 border-emerald-400/80 flex items-center justify-center p-1 text-emerald-200 shrink-0 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-emerald-300">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M50 20 L58 36 L76 38 L62 50 L66 68 L50 58 L34 68 L38 50 L24 38 L42 36 Z" fill="currentColor" opacity="0.9" />
                <circle cx="50" cy="50" r="12" fill="#064e3b" stroke="currentColor" strokeWidth="2" />
                <path d="M25 80 Q50 65 75 80" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                Government of Kerala (Simulated)
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight group-hover:text-emerald-300 transition">
                Chief Minister&apos;s Public Grievance Redressal Portal
              </h1>
              <div className="text-[10px] sm:text-xs text-emerald-300/80">
                മുഖ്യമന്ത്രിയുടെ ജനസമ്പർക്ക പരിഹാര പോർട്ടൽ
              </div>
            </div>
          </Link>

          {/* User Status / Quick Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={role === 'cmo_admin' ? '/cmo' : role === 'dept_officer' ? '/officer' : '/citizen'}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-700"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-300" />
                  {role === 'cmo_admin' ? 'CMO Dashboard' : role === 'dept_officer' ? 'Officer Portal' : 'Citizen Dashboard'}
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-emerald-900 text-emerald-300 hover:text-white transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-emerald-100 hover:text-white hover:bg-emerald-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm"
                >
                  Register Citizen
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-emerald-200 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 4. NAVIGATION BAR */}
      <nav className="bg-slate-50 border-b border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2.5 font-medium border-b-2 transition ${
                isActive('/')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              Home
            </Link>

            <Link
              to="/submit"
              className={`px-3 py-2.5 font-medium border-b-2 transition flex items-center gap-1.5 ${
                isActive('/submit')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Submit Grievance
            </Link>

            <Link
              to="/track"
              className={`px-3 py-2.5 font-medium border-b-2 transition flex items-center gap-1.5 ${
                isActive('/track')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              Track Grievance
            </Link>

            <Link
              to="/departments"
              className={`px-3 py-2.5 font-medium border-b-2 transition flex items-center gap-1.5 ${
                isActive('/departments')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Departments
            </Link>

            <Link
              to="/how-it-works"
              className={`px-3 py-2.5 font-medium border-b-2 transition ${
                isActive('/how-it-works')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              How It Works
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2.5 font-medium border-b-2 transition ${
                isActive('/about')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/faq"
              className={`px-3 py-2.5 font-medium border-b-2 transition flex items-center gap-1 ${
                isActive('/faq')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              FAQ
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-2.5 font-medium border-b-2 transition flex items-center gap-1 ${
                isActive('/contact')
                  ? 'border-emerald-600 text-emerald-800 font-semibold bg-emerald-50/50'
                  : 'border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
              Contact
            </Link>
          </div>

          <div className="flex items-center text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            24x7 Citizen Redressal SLA Active
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            Home
          </Link>
          <Link
            to="/submit"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-emerald-700 border-b border-slate-100"
          >
            Submit Grievance
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            Track Grievance
          </Link>
          <Link
            to="/departments"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            Departments
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            How It Works
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            About Us
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700"
          >
            Contact Helpdesk
          </Link>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  Signed in as <strong>{user.name}</strong> ({role})
                </div>
                <Link
                  to={role === 'cmo_admin' ? '/cmo' : role === 'dept_officer' ? '/officer' : '/citizen'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 bg-emerald-700 text-white rounded text-sm font-semibold"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-slate-300 rounded text-sm font-medium text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-emerald-600 text-white rounded text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
