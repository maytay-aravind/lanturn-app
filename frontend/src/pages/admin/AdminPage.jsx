import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';
import {
  Users, Briefcase, GraduationCap, Building2, ShieldCheck,
  BarChart3, Settings, Search, ChevronDown, CheckCircle2,
  XCircle, Clock, Eye, Loader2, AlertTriangle, Power,
  Shield, UserCheck, UserX, Activity, TrendingUp, FileText
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'jobs', label: 'Job Management', icon: Briefcase },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
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

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-5 animate-slide-up group hover:shadow-md transition-all">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-brand-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-brand-900 mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-brand-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Tab 1: Overview ───────────────────────────────────────── */
function OverviewTab() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'summary'],
    queryFn: adminService.getAnalyticsSummary,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const s = summary || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={s.users ?? 0} color="bg-brand-50 text-brand-600" />
        <StatCard icon={GraduationCap} label="Students" value={s.students ?? 0} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Building2} label="Employers" value={s.employers ?? 0} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Briefcase} label="Active Jobs" value={s.activeJobs ?? 0} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={FileText} label="Applications" value={s.applications ?? 0} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Quick Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Platform Health */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-bold text-brand-900">Platform Health</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">All Systems Operational</span>
              </div>
              <span className="text-xs text-emerald-600">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-lg font-bold text-brand-900">{s.users ?? 0}</p>
                <p className="text-xs text-brand-500">Registered Users</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-lg font-bold text-brand-900">{s.activeJobs ?? 0}</p>
                <p className="text-xs text-brand-500">Open Positions</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-bold text-brand-900">User Distribution</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Students', value: s.students ?? 0, total: s.users || 1, color: '#3b82f6' },
              { label: 'Employers', value: s.employers ?? 0, total: s.users || 1, color: '#8b5cf6' },
            ].map(item => {
              const pct = Math.round((item.value / item.total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-brand-600">{item.label}</span>
                    <span className="text-sm font-semibold text-brand-900">{item.value} <span className="text-brand-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-700">Total Applications</span>
              <span className="text-xl font-bold text-brand-700">{s.applications ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
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

/* ── Tab 4: Platform Settings ──────────────────────────────── */
function SettingsTab() {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState(null);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin', 'platformConfig'],
    queryFn: adminService.getPlatformConfig,
    onSuccess: (cfg) => {
      if (!localConfig) setLocalConfig(cfg);
    },
  });

  // Sync local state when server data loads
  const currentConfig = localConfig || config || {};

  const updateMutation = useMutation({
    mutationFn: (body) => adminService.updatePlatformConfig(body),
    onSuccess: (data) => {
      toast.success('Platform settings saved!');
      setLocalConfig(data);
      queryClient.invalidateQueries({ queryKey: ['admin', 'platformConfig'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to save settings'),
  });

  const handleToggle = (field) => {
    if (field === 'maintenanceMode' && !currentConfig.maintenanceMode) {
      setShowMaintenanceConfirm(true);
      return;
    }
    const updated = { ...currentConfig, [field]: !currentConfig[field] };
    setLocalConfig(updated);
  };

  const handleSave = () => {
    updateMutation.mutate(localConfig || currentConfig);
  };

  const confirmMaintenance = () => {
    const updated = { ...currentConfig, maintenanceMode: true };
    setLocalConfig(updated);
    setShowMaintenanceConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-brand-900">Platform Configuration</h2>
        <p className="text-sm text-brand-500 mt-1">Manage platform-wide settings and feature toggles</p>
      </div>

      <div className="space-y-4">
        {/* Signup Toggle */}
        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900">User Registration</p>
              <p className="text-xs text-brand-500 mt-0.5">Allow new users to sign up on the platform</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('signupEnabled')}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
              currentConfig.signupEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              currentConfig.signupEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Maintenance Mode */}
        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              currentConfig.maintenanceMode ? 'bg-amber-50' : 'bg-slate-50'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${currentConfig.maintenanceMode ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900">Maintenance Mode</p>
              <p className="text-xs text-brand-500 mt-0.5">Temporarily disable the platform for maintenance</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('maintenanceMode')}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
              currentConfig.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
            }`}
          >
            <div className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              currentConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* AI Daily Limit */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Power className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900">AI Daily Limit</p>
              <p className="text-xs text-brand-500 mt-0.5">Maximum AI requests per user per day</p>
            </div>
          </div>
          <input
            type="number"
            min="1"
            max="500"
            value={currentConfig.aiDailyLimit ?? 20}
            onChange={e => setLocalConfig({ ...currentConfig, aiDailyLimit: parseInt(e.target.value) || 20 })}
            className="input w-32"
          />
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="btn-primary px-8 flex items-center gap-2"
      >
        {updateMutation.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Settings className="h-4 w-4" /> Save Settings</>
        )}
      </button>

      {/* Maintenance confirmation dialog */}
      {showMaintenanceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowMaintenanceConfirm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-brand-900">Enable Maintenance Mode?</h3>
                <p className="text-xs text-brand-500">Users will be unable to access the platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowMaintenanceConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmMaintenance}
                className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Page ───────────────────────────────────────── */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

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
          <p className="text-sm text-brand-500 mt-1 ml-10">Platform management and analytics</p>
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'jobs' && <JobsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}