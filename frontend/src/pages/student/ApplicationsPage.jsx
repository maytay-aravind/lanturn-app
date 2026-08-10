import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/application.service.js';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonList } from '../../components/ui/Skeleton.jsx';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';
import { Briefcase, Building2, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'badge-yellow',
  viewed: 'badge-blue',
  shortlisted: 'badge-purple',
  interviewing: 'badge-purple',
  accepted: 'badge-green',
  rejected: 'badge-red',
  withdrawn: 'badge-default bg-slate-100 text-brand-600',
};

export default function ApplicationsPage() {
  const qc = useQueryClient();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">My Applications</h1>
        <p className="text-brand-500 mt-1">Track the status of your internal job applications</p>
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="document"
          title="No applications yet"
          description="You haven't applied to any internal jobs yet. Check out the job board."
          action={{ label: 'Browse Jobs', onClick: () => window.location.href = '/jobs' }}
        />
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="card p-5 animate-slide-up">
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
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  
                  {app.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to withdraw this application?')) {
                          withdrawMutation.mutate(app.id);
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