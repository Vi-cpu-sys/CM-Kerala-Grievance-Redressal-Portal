import React from 'react';
import { GrievancePriority, GrievanceStatus } from '../types';

interface StatusBadgeProps {
  status: GrievanceStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<GrievanceStatus, { bg: string; text: string; dot: string; label: string }> = {
    'Submitted': {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      label: 'Submitted'
    },
    'Under Review': {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
      label: 'Under Review'
    },
    'In Progress': {
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-800',
      dot: 'bg-indigo-500',
      label: 'In Progress'
    },
    'Action Submitted': {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-800',
      dot: 'bg-purple-500',
      label: 'ATR Submitted'
    },
    'Resolved': {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      label: 'Resolved'
    }
  };

  const current = styles[status] || styles['Submitted'];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: GrievancePriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const styles: Record<GrievancePriority, { bg: string; text: string; border: string }> = {
    'High': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'Medium': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Low': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
  };

  const current = styles[priority] || styles['Medium'];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}>
      {priority === 'High' && <span className="mr-1 text-rose-600 font-bold">!</span>}
      {priority} Priority
    </span>
  );
};

export const OverdueBadge: React.FC<{ isOverdue?: boolean; escalated?: boolean }> = ({
  isOverdue,
  escalated
}) => {
  if (!isOverdue && !escalated) return null;

  return (
    <div className="inline-flex items-center gap-1">
      {isOverdue && (
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-600 text-white rounded">
          SLA Overdue
        </span>
      )}
      {escalated && (
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-700 text-white rounded">
          CMO Escalated
        </span>
      )}
    </div>
  );
};
