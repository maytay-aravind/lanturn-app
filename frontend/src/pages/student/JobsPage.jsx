import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobService } from '../../services/job.service.js';
import { applicationService } from '../../services/application.service.js';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonList } from '../../components/ui/Skeleton.jsx';
import { formatSalary, timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';
import {
  Search, MapPin, Briefcase, Clock, DollarSign,
  Building2, ChevronRight, CheckCircle2, ChevronDown
} from 'lucide-react';

const STATUS_COLORS = {
  active: 'badge-green',
  closed: 'badge-default bg-slate-100 text-slate-600',
  paused: 'badge-yellow',
};

function InternalJobCard({ job, onApply }) {
  const [expanded, setExpanded] = useState(false);
  const loc = typeof job.location === 'object'
    ? [job.location?.city, job.location?.country].filter(Boolean).join(', ')
    : (job.location || 'Remote');
    
  const salaryText = job.salary?.min
    ? formatSalary(job.salary.min, job.salary.max, job.salary.currency)
    : (job.salaryMin ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) : null);

  const isApplied = job.hasApplied || false;

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 border border-brand-100">
            <Building2 className="h-6 w-6 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-lg truncate">{job.title}</h3>
              {job.status && <span className={`badge ${STATUS_COLORS[job.status] || 'badge-default'}`}>{job.status}</span>}
            </div>
            <p className="text-sm font-medium text-slate-600">{job.companyName}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {loc && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />{loc}
                </span>
              )}
              {job.type && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Briefcase className="h-3.5 w-3.5" />{job.type}
                </span>
              )}
              {salaryText && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <DollarSign className="h-3.5 w-3.5" />{salaryText}
                </span>
              )}
              {job.createdAt && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />{timeAgo(job.createdAt)}
                </span>
              )}
            </div>

            <div className={`mt-3 text-sm text-slate-600 relative transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}>
              {job.description}
            </div>
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 mt-2 flex items-center gap-1"
            >
              {expanded ? 'Show less' : 'Read more'} <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
          {job.status === 'active' && (
            isApplied ? (
              <span className="badge-green px-3 py-1.5 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Applied
              </span>
            ) : (
              <button
                onClick={() => onApply(job.jobId || job.id)}
                className="btn-primary w-full sm:w-auto"
              >
                Apply Now
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState({ limit: 10, cursor: null });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['jobs', search, typeFilter, page],
    queryFn: () => jobService.list({ q: search || undefined, jobType: typeFilter || undefined, ...page }),
  });

  const jobs = data?.items ?? [];
  const nextCursor = data?.nextCursor;

  const applyMutation = useMutation({
    mutationFn: (jobId) => applicationService.apply(jobId),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to apply'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Internal Job Board</h1>
        <p className="text-slate-500 mt-1">Exclusive opportunities for lanTURN students</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && refetch()}
            className="input pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Job Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>
        <button onClick={() => refetch()} className="btn-primary">
          Filter
        </button>
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="search"
          title="No internal jobs found"
          description="Try adjusting your filters, or check out our external Job Search."
          action={{ label: 'Go to External Jobs', onClick: () => window.location.href = '/job-search' }}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <InternalJobCard
              key={job.jobId || job.id}
              job={job}
              onApply={(id) => applyMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setPage((p) => ({ ...p, cursor: nextCursor }))}
            disabled={isFetching}
            className="btn-secondary"
          >
            {isFetching ? 'Loading...' : 'Load More Jobs'}
          </button>
        </div>
      )}
    </div>
  );
}