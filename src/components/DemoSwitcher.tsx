import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, Building2, User, KeyRound } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, role, quickSwitchDemo, logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (targetRole: 'citizen' | 'cmo_admin' | 'dept_officer') => {
    await quickSwitchDemo(targetRole);
    if (targetRole === 'cmo_admin') navigate('/cmo');
    else if (targetRole === 'dept_officer') navigate('/officer');
    else navigate('/citizen');
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            <KeyRound className="w-3.5 h-3.5" />
            Evaluator Quick Switch:
          </span>
          <span className="text-slate-300 hidden md:inline">
            Active: <strong className="text-white uppercase">{role || 'Public Visitor'}</strong>
            {user && ` (${user.name})`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleSwitch('citizen')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              role === 'citizen'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Login as Citizen (citizen.kerala@test.com)"
          >
            <User className="w-3 h-3" />
            Citizen (Ananya)
          </button>

          <button
            onClick={() => handleSwitch('cmo_admin')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              role === 'cmo_admin'
                ? 'bg-amber-600 text-white font-medium shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Login as CMO Admin (cmo.admin@kerala.gov.fake)"
          >
            <Shield className="w-3 h-3" />
            CMO Admin (IAS)
          </button>

          <button
            onClick={() => handleSwitch('dept_officer')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              role === 'dept_officer'
                ? 'bg-emerald-600 text-white font-medium shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Login as PWD Officer (pwd.officer@kerala.gov.fake)"
          >
            <Building2 className="w-3 h-3" />
            PWD Officer (Er. Rajesh)
          </button>

          {user && (
            <button
              onClick={() => logout()}
              className="ml-2 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
