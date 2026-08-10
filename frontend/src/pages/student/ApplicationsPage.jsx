import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/application.service.js';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonList } from '../../components/ui/Skeleton.jsx';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';
import {
  Briefcase, Building2, ChevronRight, AlertCircle, FileText,
  LayoutGrid, List, Clock, CheckCircle2, XCircle, Eye, UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const KANBAN_COLUMNS = [
  { id: 'submitted',   title: 'Applied',     color: '#3b82f6', icon: Clock },
  { id: 'reviewed',    title: 'Reviewing',   color: '#f59e0b', icon: Eye },
  { id: 'shortlisted', title: 'Shortlisted', color: '#10b981', icon: UserCheck },
  { id: 'accepted',    title: 'Hired 🎉',    color: '#8b5cf6', icon: CheckCircle2 },
  { id: 'rejected',    title: 'Rejected',    color: '#ef4444', icon: XCircle },
];

const STATUS_COLORS = {
  submitted:    'badge-blue',
  pending:      'badge-yellow',
  viewed:       'badge-blue',
  reviewed:     'badge-yellow',
  shortlisted:  'badge-purple',
  interviewing: 'badge-purple',
  accepted:     'badge-green',
  rejected:     'badge-red',
  withdrawn:    'badge-default bg-slate-100 text-brand-600',
};

function StatusLabel({ status }) {
  const labels = {
    submitted: 'Applied',
    reviewed: 'Reviewing',
    shortlisted: 'Shortlisted',
    accepted: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[status] || status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
}

/* ── Kanban Column (read-only for students) ───────────────── */
function KanbanColumn({ column, items, onWithdraw, withdrawPending }) {
  const Icon = column.icon;

  return (
    <div className="flex-1 min-w-[240px] max-w-[320px] flex flex-col rounded-2xl border-2 border-slate-200 bg-slate-50/80">
      {/* Column header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
        <div
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-sm font-bold text-slate-800 flex-1 truncate">
          {column.title}
        </h3>
        <span className="text-xs font-semibold text-slate-400 bg-white rounded-full px-2 py-0.5 border border-slate-200">
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[100px] max-h-[60vh]">
        {items.map((app) => (
          <div
            key={app.applicationId || app.id}
            className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow animate-slide-up"
          >
            <div className="flex items-start gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                <Building2 className="h-4 w-4 text-brand-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{app.jobTitle || 'Job'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(app.createdAt || app.appliedAt)}</p>
              </div>
            </div>

            {app.coverLetter && (
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 pl-[42px]">{app.coverLetter}</p>
            )}

            {/* Withdraw button for submitted status */}
            {(app.status === 'submitted' || app.status === 'pending') && (
              <div className="pl-[42px]">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to withdraw this application?')) {
                      onWithdraw(app.applicationId || app.id);
                    }
                  }}
                  disabled={withdrawPending}
                  className="text-[10px] font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-slate-400 italic">
            No applications
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban');

  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'mine'],
    queryFn: () => applicationService.listMine({ limit: 50 }),
  });

  const applications = data?.items ?? [];

  const withdrawMutation = useMutation({
    mutationFn: applicationService.withdraw,
    onSuccess: () => {
      toast.success('Application withdrawn');
      qc.invalidateQueries({ queryKey: ['applications', 'mine'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to withdraw'),
  });

  // Group applications by status for kanban
  const groupedByStatus = {};
  KANBAN_COLUMNS.forEach((col) => {
    groupedByStatus[col.id] = applications.filter((app) => app.status === col.id);
  });

  // Count by status for summary
  const totalByStatus = {};
  applications.forEach((app) => {
    totalByStatus[app.status] = (totalByStatus[app.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">My Applications</h1>
          <p className="text-brand-500 mt-1">Track the status of your job applications</p>
        </div>

        {/* View toggle */}
        {applications.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
        )}
      </div>

      {/* Pipeline summary badges */}
      {applications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {KANBAN_COLUMNS.map((col) => {
            const cnt = totalByStatus[col.id] || 0;
            if (cnt === 0) return null;
            return (
              <span
                key={col.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  color: col.color,
                  borderColor: col.color + '40',
                  backgroundColor: col.color + '10',
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                {col.title.replace(' 🎉', '')} ({cnt})
              </span>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <SkeletonList count={4} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="document"
          title="No applications yet"
          description="You haven't applied to any internal jobs yet. Check out the job board."
          action={{ label: 'Browse Jobs', onClick: () => window.location.href = '/jobs' }}
        />
      ) : viewMode === 'kanban' ? (
        /* ── KANBAN VIEW ────────────────────────── */
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              items={groupedByStatus[col.id] || []}
              onWithdraw={(id) => withdrawMutation.mutate(id)}
              withdrawPending={withdrawMutation.isPending}
            />
          ))}
        </div>
      ) : (
        /* ── LIST VIEW ──────────────────────────── */
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.applicationId || app.id} className="card p-5 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                
                {/* Left col */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <Building2 className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-900">{app.jobTitle || 'Job'}</h3>
                    <p className="text-sm font-medium text-brand-600">{app.companyName || 'Company'}</p>
                    <p className="text-xs text-brand-400 mt-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Applied {timeAgo(app.createdAt || app.appliedAt)}
                    </p>
                    
                    {app.coverLetter && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 text-sm text-brand-600 border border-slate-100">
                        <p className="font-medium text-xs text-brand-400 mb-1 uppercase tracking-wider">Cover Letter</p>
                        <p className="line-clamp-2">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right col */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto">
                  <span className={`badge ${STATUS_COLORS[app.status] || 'badge-default'}`}>
                    <StatusLabel status={app.status} />
                  </span>
                  
                  {(app.status === 'submitted' || app.status === 'pending') && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to withdraw this application?')) {
                          withdrawMutation.mutate(app.applicationId || app.id);
                        }
                      }}
                      disabled={withdrawMutation.isPending}
                      className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}