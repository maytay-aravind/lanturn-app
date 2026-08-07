import { useQuery } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { Link } from 'react-router-dom';
import { timeAgo } from '../../lib/utils.js';
import {
  Briefcase, Users, TrendingUp, UserCheck, UserX, Award,
  BarChart3, Activity, ArrowUpRight, PauseCircle, Eye,
} from 'lucide-react';

/* ── Tiny SVG donut chart ─────────────────────────────────── */
function DonutChart({ segments, size = 160 }) {
  const r = 56, cx = 80, cy = 80, circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className="mx-auto">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            className="transition-all duration-700"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-900 text-2xl font-bold">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-400 text-xs">Total</text>
    </svg>
  );
}

/* ── Bar chart (applications per day) ─────────────────────── */
function MiniBarChart({ data }) {
  const entries = Object.entries(data || {});
  if (entries.length === 0) return <p className="text-sm text-slate-400">No data yet</p>;
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-[3px] h-28 w-full">
      {entries.map(([date, count]) => (
        <div key={date} className="flex-1 flex flex-col items-center group relative">
          <div
            className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
            style={{
              height: `${Math.max((count / max) * 100, 4)}%`,
              background: count > 0 ? 'linear-gradient(180deg, #6366f1 0%, #818cf8 100%)' : '#e2e8f0',
              minHeight: '2px',
            }}
          />
          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {date.slice(5)}: {count}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, sub, link }) {
  const Wrapper = link ? Link : 'div';
  const props = link ? { to: link } : {};
  return (
    <Wrapper {...props} className="stat-card group hover:shadow-md transition-all animate-slide-up">
      <div className={`stat-icon ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {link && <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 transition-colors" />}
    </Wrapper>
  );
}

/* ── Progress metric ──────────────────────────────────────── */
function MetricBar({ label, value, max, color = '#6366f1' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  submitted:   { label: 'Applied',     cls: 'badge-blue' },
  reviewed:    { label: 'Reviewing',   cls: 'badge-yellow' },
  shortlisted: { label: 'Shortlisted', cls: 'badge-green' },
  accepted:    { label: 'Hired',       cls: 'badge-purple' },
  rejected:    { label: 'Rejected',    cls: 'badge-red' },
  withdrawn:   { label: 'Withdrawn',   cls: 'badge-default' },
};

export default function EmployerDashboard() {
  const { data: profile } = useQuery({
    queryKey: ['employer', 'me'],
    queryFn: employerService.getMe,
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['employer', 'analytics'],
    queryFn: employerService.getAnalytics,
  });

  const a = analytics || {};
  const sb = a.statusBreakdown || {};

  const donutSegments = [
    { value: sb.submitted || 0,   color: '#3b82f6' },
    { value: sb.reviewed || 0,    color: '#f59e0b' },
    { value: sb.shortlisted || 0, color: '#10b981' },
    { value: sb.accepted || 0,    color: '#8b5cf6' },
    { value: sb.rejected || 0,    color: '#ef4444' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 skeleton-title w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.companyName || 'Employer'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.industry && `${profile.industry} · `}
            Here's your recruitment overview
          </p>
        </div>
        <Link to="/employer/jobs" className="btn-primary btn-sm flex items-center gap-1.5 self-start">
          <Briefcase className="h-3.5 w-3.5" /> Post New Job
        </Link>
      </div>

      {/* ── Stat Cards Row ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase} label="Active Jobs" value={a.activeJobs ?? 0}
          color="bg-blue-50 text-blue-600"
          sub={a.pausedJobs ? `${a.pausedJobs} paused` : undefined}
          link="/employer/jobs"
        />
        <StatCard
          icon={Users} label="Total Applicants" value={a.totalApplicants ?? 0}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={UserCheck} label="Shortlisted" value={sb.shortlisted ?? 0}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Award} label="Hired" value={sb.accepted ?? 0}
          color="bg-amber-50 text-amber-600"
          sub={`${a.conversionRate ?? 0}% conversion`}
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recruitment Pipeline (Donut) */}
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            <h2 className="section-title">Recruitment Pipeline</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart segments={donutSegments} />
            <div className="space-y-2 flex-1 w-full">
              {[
                { label: 'Applied',     value: sb.submitted,   color: '#3b82f6' },
                { label: 'Reviewing',   value: sb.reviewed,    color: '#f59e0b' },
                { label: 'Shortlisted', value: sb.shortlisted, color: '#10b981' },
                { label: 'Hired',       value: sb.accepted,    color: '#8b5cf6' },
                { label: 'Rejected',    value: sb.rejected,    color: '#ef4444' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Over Time */}
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-brand-600" />
            <h2 className="section-title">Applications (Last 30 Days)</h2>
          </div>
          <MiniBarChart data={a.applicationsPerDay} />
          <div className="flex justify-between mt-3 text-[10px] text-slate-400">
            <span>{Object.keys(a.applicationsPerDay || {}).at(0)?.slice(5) || ''}</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* ── Conversion & Breakdown Row ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hiring Metrics */}
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <h2 className="section-title">Hiring Metrics</h2>
          </div>
          <div className="space-y-4">
            <MetricBar label="Shortlisted" value={sb.shortlisted || 0} max={a.totalApplicants || 0} color="#10b981" />
            <MetricBar label="Hired" value={sb.accepted || 0} max={a.totalApplicants || 0} color="#8b5cf6" />
            <MetricBar label="Rejected" value={sb.rejected || 0} max={a.totalApplicants || 0} color="#ef4444" />
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-700">Hiring Conversion Rate</span>
              <span className="text-xl font-bold text-brand-700">{a.conversionRate ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* Job Overview */}
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-brand-600" />
            <h2 className="section-title">Job Overview</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">{a.activeJobs ?? 0}</p>
              <p className="text-xs text-blue-600 mt-0.5">Active</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-700">{a.pausedJobs ?? 0}</p>
              <p className="text-xs text-amber-600 mt-0.5">Paused</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-2xl font-bold text-slate-700">{a.closedJobs ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Closed</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-2xl font-bold text-violet-700">{a.totalJobs ?? 0}</p>
              <p className="text-xs text-violet-600 mt-0.5">Total Posted</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Applications ─────────────────────────── */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-brand-600" />
            <h2 className="section-title">Recent Applications</h2>
          </div>
        </div>
        {(a.recentApplications || []).length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No applications yet. Post a job to get started!</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {(a.recentApplications || []).map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;
              return (
                <div key={app.applicationId} className="py-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-sm font-bold flex-shrink-0">
                    {(app.studentName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{app.studentName}</p>
                    <p className="text-xs text-slate-400 truncate">Applied to {app.jobTitle}</p>
                  </div>
                  <span className={cfg.cls}>{cfg.label}</span>
                  <span className="text-xs text-slate-400 hidden sm:block">{timeAgo(app.appliedAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}