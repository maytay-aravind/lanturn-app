import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';
import {
  Users, Briefcase, Building2, ShieldCheck,
  Search, CheckCircle2,
  XCircle, Loader2,
  Shield, UserCheck, UserX,
} from 'lucide-react';

const TABS = [
  { id: 'verification', label: 'Post Verification', icon: ShieldCheck },
  { id: 'jobs', label: 'Job Management', icon: Briefcase },
  { id: 'users', label: 'User Management', icon: Users },
];

const JOB_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'verified', label: 'Verified' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
  { value: 'removed', label: 'Removed' },
];

const JOB_STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  verified: 'bg-blue-50 text-blue-700 border-blue-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  removed: 'bg-red-50 text-red-700 border-red-200',
};

const ROLE_COLORS = {
  student: 'bg-blue-50 text-blue-700 border-blue-200',
  employer: 'bg-purple-50 text-purple-700 border-purple-200',
  admin: 'bg-amber-50 text-amber-700 border-amber-200',
};

/* ── Tab 1: Post Verification ──────────────────────────────── */
function PostVerificationTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: adminService.listJobs,
  });

  const verifyMutation = useMutation({
    mutationFn: (jobId) => adminService.verifyJob(jobId),
    onSuccess: () => {
      toast.success('Job verified successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to verify job'),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ jobId, status }) => adminService.moderateJob(jobId, status),
    onSuccess: () => {
      toast.success('Job status updated!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update job'),
  });

  const jobs = useMemo(() => {
    let items = data?.items || data || [];
    if (!Array.isArray(items)) items = [];
    if (statusFilter) items = items.filter(j => j.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(j =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.companyName || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, statusFilter, search]);

  const totalJobs = (data?.items || data || []).length;
  const verifiedCount = (data?.items || data || []).filter(j => j.verifiedByAdmin).length;
  const pendingCount = totalJobs - verifiedCount;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-900">{totalJobs}</p>
          <p className="text-xs text-brand-500 mt-1">Total Posts</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{verifiedCount}</p>
          <p className="text-xs text-brand-500 mt-1">Verified</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-brand-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-brand-900">All Company Posts</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input w-36"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="verified">Verified</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Post List */}
      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="h-8 w-8 text-brand-300 mx-auto mb-3" />
          <p className="text-brand-500 font-medium">No posts found</p>
          <p className="text-xs text-brand-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const jobId = job.jobId || job.id;
            const statusCls = JOB_STATUS_COLORS[job.status] || JOB_STATUS_COLORS.draft;
            return (
              <div key={jobId} className="card p-4 sm:p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 border border-brand-100 overflow-hidden">
                      {job.companyLogoURL ? (
                        <img src={job.companyLogoURL} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5 text-brand-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-brand-900 truncate">{job.title}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${statusCls}`}>
                          {job.status}
                        </span>
                        {job.verifiedByAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-500 mt-0.5">{job.companyName || '—'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-brand-400">
                        {job.jobType && <span>{job.jobType}</span>}
                        {job.createdAt && <span>Posted {timeAgo(job.createdAt)}</span>}
                        <span>{job.applicationCount ?? 0} applicants</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!job.verifiedByAdmin ? (
                      <button
                        onClick={() => verifyMutation.mutate(jobId)}
                        disabled={verifyMutation.isPending}
                        className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Verify
                      </button>
                    ) : (
                      <span className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value) moderateMutation.mutate({ jobId, status: e.target.value });
                      }}
                      className="px-3 py-2 rounded-lg bg-slate-50 text-brand-600 text-xs font-medium border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="">Change Status</option>
                      <option value="active">Set Active</option>
                      <option value="paused">Pause</option>
                      <option value="closed">Close</option>
                      <option value="removed">Remove</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Tab 2: Job Management ─────────────────────────────────── */
function JobsTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: adminService.listJobs,
  });

  const verifyMutation = useMutation({
    mutationFn: (jobId) => adminService.verifyJob(jobId),
    onSuccess: () => {
      toast.success('Job verified successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to verify job'),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ jobId, status }) => adminService.moderateJob(jobId, status),
    onSuccess: () => {
      toast.success('Job status updated!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update job'),
  });

  const jobs = useMemo(() => {
    let items = data?.items || data || [];
    if (!Array.isArray(items)) items = [];
    if (statusFilter) items = items.filter(j => j.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(j =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.companyName || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, statusFilter, search]);

  const totalJobs = (data?.items || data || []).length;
  const verifiedCount = (data?.items || data || []).filter(j => j.verifiedByAdmin).length;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-brand-900">{totalJobs} Total Jobs</h2>
          <p className="text-sm text-brand-500">{verifiedCount} verified by LanTURN</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input w-36"
          >
            {JOB_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Table / Cards */}
      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="h-8 w-8 text-brand-300 mx-auto mb-3" />
          <p className="text-brand-500 font-medium">No jobs found</p>
          <p className="text-xs text-brand-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
            <div className="col-span-4">Job Title</div>
            <div className="col-span-2">Company</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Verified</div>
            <div className="col-span-2">Posted</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {jobs.map(job => {
            const jobId = job.jobId || job.id;
            const statusCls = JOB_STATUS_COLORS[job.status] || JOB_STATUS_COLORS.draft;
            return (
              <div key={jobId} className="card p-4 sm:p-5 hover:shadow-md transition-all">
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 min-w-0">
                    <p className="font-semibold text-brand-900 truncate">{job.title}</p>
                    <p className="text-xs text-brand-400 mt-0.5">{job.applicationCount ?? 0} applicants</p>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm text-brand-600 truncate">{job.companyName || '—'}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${statusCls}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="col-span-1">
                    {job.verifiedByAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-brand-400">No</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-brand-500">{job.createdAt ? timeAgo(job.createdAt) : '—'}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {!job.verifiedByAdmin && (
                      <button
                        onClick={() => verifyMutation.mutate(jobId)}
                        disabled={verifyMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="h-3 w-3" /> Verify
                      </button>
                    )}
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value) moderateMutation.mutate({ jobId, status: e.target.value });
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-50 text-brand-600 text-xs font-medium border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="">Change Status</option>
                      <option value="active">Set Active</option>
                      <option value="paused">Pause</option>
                      <option value="closed">Close</option>
                      <option value="removed">Remove</option>
                    </select>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-900 truncate">{job.title}</p>
                      <p className="text-sm text-brand-500">{job.companyName || '—'}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0 ${statusCls}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {job.verifiedByAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => verifyMutation.mutate(jobId)}
                        disabled={verifyMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="h-3 w-3" /> Verify
                      </button>
                    )}
                    <span className="text-xs text-brand-400">{job.applicationCount ?? 0} applicants</span>
                    <span className="text-xs text-brand-400">{job.createdAt ? timeAgo(job.createdAt) : ''}</span>
                  </div>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) moderateMutation.mutate({ jobId, status: e.target.value });
                    }}
                    className="input w-full text-sm"
                  >
                    <option value="">Change Status…</option>
                    <option value="active">Set Active</option>
                    <option value="paused">Pause</option>
                    <option value="closed">Close</option>
                    <option value="removed">Remove</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Tab 3: User Management ────────────────────────────────── */
function UsersTab() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter, statusFilter],
    queryFn: () => adminService.listUsers({
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      limit: 100,
    }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ uid, status }) => adminService.updateUserStatus(uid, status),
    onSuccess: () => {
      toast.success('User status updated!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update user'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ uid, role }) => adminService.updateUserRole(uid, role),
    onSuccess: () => {
      toast.success('User role updated!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update role'),
  });

  const users = useMemo(() => {
    let items = data?.items || [];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(u =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, search]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-brand-900">{users.length} Users</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:flex-initial sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-32">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-32">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* User List */}
      {users.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-8 w-8 text-brand-300 mx-auto mb-3" />
          <p className="text-brand-500 font-medium">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {users.map(user => {
            const roleCls = ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600 border-slate-200';
            const isActive = user.status === 'active';
            return (
              <div key={user.uid} className="card p-4 sm:p-5 hover:shadow-md transition-all">
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-sm font-bold flex-shrink-0 border border-brand-100">
                      {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-900 truncate">{user.displayName || '—'}</p>
                      <p className="text-xs text-brand-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border capitalize ${roleCls}`}>
                      {user.role || 'none'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="h-3 w-3" /> Disabled
                      </span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-brand-500">{user.createdAt ? timeAgo(user.createdAt) : '—'}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => statusMutation.mutate({
                        uid: user.uid,
                        status: isActive ? 'disabled' : 'active',
                      })}
                      disabled={statusMutation.isPending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 ${
                        isActive
                          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? <><UserX className="h-3 w-3" /> Disable</> : <><UserCheck className="h-3 w-3" /> Enable</>}
                    </button>
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value) roleMutation.mutate({ uid: user.uid, role: e.target.value });
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-50 text-brand-600 text-xs font-medium border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="">Change Role</option>
                      <option value="student">Student</option>
                      <option value="employer">Employer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold flex-shrink-0 border border-brand-100">
                      {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brand-900 truncate">{user.displayName || '—'}</p>
                      <p className="text-xs text-brand-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border capitalize ${roleCls}`}>
                      {user.role || 'none'}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Disabled
                      </span>
                    )}
                    <span className="text-xs text-brand-400">{user.createdAt ? timeAgo(user.createdAt) : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => statusMutation.mutate({
                        uid: user.uid,
                        status: isActive ? 'disabled' : 'active',
                      })}
                      disabled={statusMutation.isPending}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1 ${
                        isActive
                          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? <><UserX className="h-3 w-3" /> Disable</> : <><UserCheck className="h-3 w-3" /> Enable</>}
                    </button>
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value) roleMutation.mutate({ uid: user.uid, role: e.target.value });
                      }}
                      className="flex-1 input text-sm"
                    >
                      <option value="">Change Role…</option>
                      <option value="student">Student</option>
                      <option value="employer">Employer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Page ───────────────────────────────────────── */
export default function AdminPage() {
  const hash = window.location.hash.replace('#', '');
  const initialTab = TABS.find(t => t.id === hash) ? hash : 'verification';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const h = window.location.hash.replace('#', '');
    if (TABS.find(t => t.id === h)) setActiveTab(h);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-brand-900">Admin Portal</h1>
          </div>
          <p className="text-sm text-brand-500 mt-1 ml-10">Manage posts, jobs, and users</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap relative ${
                isActive
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-brand-500 hover:text-brand-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'verification' && <PostVerificationTab />}
        {activeTab === 'jobs' && <JobsTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
}