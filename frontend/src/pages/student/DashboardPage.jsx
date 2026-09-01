import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/student.service.js';
import { applicationService } from '../../services/application.service.js';
import { roadmapService } from '../../services/roadmap.service.js';
import { employerService } from '../../services/employer.service.js';
import { Link } from 'react-router-dom';
import { SkeletonList, SkeletonProfile } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Briefcase, CheckCircle2, ChevronRight, Clock, Star, Trophy, Target, TrendingUp, ArrowUpRight, Map } from 'lucide-react';
import { timeAgo } from '../../lib/utils.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const STATUS_COLORS = {
  submitted:  '#64748b',
  reviewed:   '#6366f1',
  shortlisted:'#a855f7',
  accepted:   '#22c55e',
  rejected:   '#ef4444',
  withdrawn:  '#94a3b8',
};

const STATUS_LABELS = {
  submitted:  'Applied',
  reviewed:   'Reviewed',
  shortlisted:'Shortlisted',
  accepted:   'Hired',
  rejected:   'Rejected',
  withdrawn:  'Withdrawn',
};

/* ── SVG Donut (matches Stitch design) ─────────────────────── */
function SVGDonut({ percent, size = 64, strokeWidth = 3, color = '#1A1A1A' }) {
  const r = 15.9155;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-brand-100"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeDasharray={`${percent}, 100`}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-sm font-bold text-brand-900">{percent}%</span>
    </div>
  );
}

/* ── Application Pie Chart ─────────────────────────────────── */
function ApplicationPieChart({ allApps }) {
  const counts = {};
  for (const app of allApps) {
    counts[app.status] = (counts[app.status] || 0) + 1;
  }
  const pieData = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value, status: name }));

  if (pieData.length === 0) {
    return <p className="text-sm text-brand-400 text-center py-8">No applications yet</p>;
  }

  const total = allApps.length;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              paddingAngle={2}
            >
              {pieData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white rounded-lg shadow-soft-lg border border-brand-100 px-3 py-2 text-sm">
                    <span className="font-semibold text-brand-900">{d.name}</span>
                    <span className="text-brand-400 ml-2">{d.value} ({Math.round((d.value / total) * 100)}%)</span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-3xl font-bold text-brand-900">{total}</span>
          <span className="text-xs text-brand-400 font-medium">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {pieData.map((d) => (
          <div key={d.status} className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[d.status] }} />
            <span className="text-sm font-medium text-brand-700 w-20">{d.name}</span>
            <span className="text-sm font-bold text-brand-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Company Ranking Chart ─────────────────────────────────── */
function CompanyRankingChart({ companies }) {
  if (!companies || companies.length === 0) {
    return <p className="text-sm text-brand-400 text-center py-8">No companies registered yet</p>;
  }
  const data = companies.map(c => ({
    name: c.companyName.length > 15 ? c.companyName.slice(0, 15) + '...' : c.companyName,
    jobs: c.totalJobs,
    applications: c.totalApplications,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              const full = companies.find(c => (c.companyName.length > 15 ? c.companyName.slice(0, 15) + '...' : c.companyName) === d.name);
              return (
                <div className="bg-white rounded-lg shadow-soft-lg border border-brand-100 px-3 py-2 text-sm">
                  <p className="font-semibold text-brand-900">{full?.companyName || d.name}</p>
                  <p className="text-brand-500">{d.jobs} jobs posted</p>
                  <p className="text-brand-500">{d.applicationTotal || d.applications} applications</p>
                  {full?.verified && <p className="text-emerald-600 text-xs mt-1">Verified</p>}
                </div>
              );
            }}
          />
          <Bar dataKey="jobs" fill="#6366f1" radius={[4, 4, 0, 0]} name="Jobs" />
          <Bar dataKey="applications" fill="#a855f7" radius={[4, 4, 0, 0]} name="Applications" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Status Badge Config ──────────────────────────────────── */
const STATUS_BADGE_CONFIG = {
  submitted:   { label: 'Applied',     cls: 'bg-brand-100 text-brand-600 border-brand-200' },
  reviewed:    { label: 'Reviewed',    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-50 text-violet-700 border-violet-200/60' },
  accepted:    { label: 'Hired',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  rejected:    { label: 'Rejected',    cls: 'bg-red-50 text-red-700 border-red-200/60' },
  withdrawn:   { label: 'Withdrawn',   cls: 'bg-brand-100 text-brand-500 border-brand-200' },
};

export default function StudentDashboard() {
  const { session } = useAuth();
  const { t } = useLanguage();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['student', 'me'],
    queryFn: studentService.getMe,
  });

  const { data: appsData, isLoading: isAppsLoading } = useQuery({
    queryKey: ['applications', 'mine'],
    queryFn: () => applicationService.listMine({ limit: 5 }),
  });

  const { data: allAppsData } = useQuery({
    queryKey: ['applications', 'mine', 'all'],
    queryFn: () => applicationService.listMine({ limit: 500 }),
  });

  const { data: roadmaps } = useQuery({
    queryKey: ['roadmaps', 'me'],
    queryFn: roadmapService.getMyRoadmaps,
  });

  const { data: topCompanies, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ['employers', 'top-companies'],
    queryFn: () => employerService.getTopCompanies(10),
  });

  const applications = appsData?.items ?? [];
  const totalApps = appsData?.meta?.totalItems ?? applications.length;
  const allApplications = allAppsData?.items ?? [];
  const enrolledRoadmaps = roadmaps ?? [];

  const getCompletion = () => {
    let score = 0;
    if (profile?.personal?.name) score += 25;
    if (profile?.academic?.college) score += 25;
    if (profile?.resumeUrl) score += 25;
    if (profile?.professional?.skills?.length > 0) score += 25;
    return score;
  };
  const completion = getCompletion();

  const displayName = profile?.personal?.name
    || session?.profile?.personal?.name
    || session?.email?.split('@')[0]
    || 'Student';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-100/50">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-brand-900 mb-2">
            {t('studentDash.welcomeBack', { name: displayName })}
          </h1>
          <p className="text-brand-400 text-lg">{t('studentDash.overview')}</p>
        </div>
        <Link
          to="/jobs"
          className="btn-primary flex items-center gap-2 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <Target className="h-4 w-4" />
          {t('studentDash.findJobs')}
        </Link>
      </header>

      {/* ── Stat Cards Row ──────────────────────────────── */}
      {isProfileLoading ? (
        <SkeletonProfile />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Applications */}
          <div className="card p-6 flex items-center gap-6 hover:shadow-soft-lg transition-all animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-6 w-6 text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-400 mb-1 uppercase tracking-wider">{t('studentDash.applications')}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-4xl font-bold text-brand-900">{totalApps}</span>
              </div>
              <Link to="/applications" className="text-sm font-medium text-brand-700 hover:text-brand-900 mt-2 flex items-center gap-1 transition-colors">
                {t('studentDash.viewApplications')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Profile Strength */}
          <div className="card p-6 flex flex-col justify-center hover:shadow-soft-lg transition-all animate-slide-up">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-brand-400 uppercase tracking-wider">{t('studentDash.profileStrength')}</p>
              <span className={`px-2 py-1 rounded text-xs font-bold border ${
                completion === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : completion >= 75
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    : 'bg-amber-50 text-amber-700 border-amber-200/60'
              }`}>
                {completion === 100 ? t('studentDash.complete') : completion >= 75 ? 'Excellent' : t('studentDash.needsInfo')}
              </span>
            </div>
            <div className="flex items-end gap-1 mb-3">
              <span className="font-headline text-4xl font-bold text-brand-900">{completion}</span>
              <span className="font-headline text-2xl text-brand-400">%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>

          {/* Top Skills */}
          <div className="card p-6 hover:shadow-soft-lg transition-all animate-slide-up">
            <p className="text-sm font-medium text-brand-400 uppercase tracking-wider mb-4">{t('studentDash.topSkills')}</p>
            <div className="flex flex-wrap gap-2">
              {(profile?.professional?.skills || []).length > 0 ? (
                (profile.professional.skills.slice(0, 5).map((s) => (
                  <span key={s} className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-md text-sm font-medium text-brand-900 flex items-center gap-1">
                    {s}
                  </span>
                )))
              ) : (
                <span className="text-sm text-brand-400">{t('studentDash.noSkillsYet')}</span>
              )}
              {(profile?.professional?.skills?.length || 0) > 5 && (
                <span className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-md text-sm font-medium text-brand-500">
                  +{profile.professional.skills.length - 5}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Main Dashboard Grid ─────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Track Record */}
        <div className="card p-6 animate-slide-up">
          <h2 className="font-headline text-lg font-bold text-brand-900 mb-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-400" /> Application Pipeline
          </h2>
          <ApplicationPieChart allApps={allApplications} />
        </div>

        {/* Recent Applications */}
        <div className="card p-6 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-lg font-bold text-brand-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-400" /> {t('studentDash.recentApplications')}
            </h2>
            <Link to="/applications" className="text-sm font-medium text-brand-400 hover:text-brand-900 transition-colors">
              {t('studentDash.viewAll')}
            </Link>
          </div>

          {isAppsLoading ? (
            <SkeletonList count={3} />
          ) : applications.length === 0 ? (
            <EmptyState
              icon="document"
              title={t('studentDash.noAppsYet')}
              description={t('studentDash.noAppsDesc')}
              action={{ label: t('studentDash.browseJobs'), onClick: () => window.location.href = '/jobs' }}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map((app) => {
                const cfg = STATUS_BADGE_CONFIG[app.status] || STATUS_BADGE_CONFIG.submitted;
                return (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-100 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-900 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                        {(app.companyName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-brand-900 truncate">{app.jobTitle || 'Job'}</h4>
                        <p className="text-sm text-brand-400 truncate">{app.companyName || 'Company'} · {timeAgo(app.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Career Aisle Progress ────────────────────────── */}
      {enrolledRoadmaps.length > 0 && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-lg font-bold text-brand-900 flex items-center gap-2">
              <Map className="h-5 w-5 text-brand-400" /> Career Aisle Progress
            </h2>
            <Link to="/career-aisle" className="text-sm font-medium text-brand-400 hover:text-brand-900 transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledRoadmaps.map((rm) => {
              const pct = rm.percentComplete ?? 0;
              const color = pct === 100 ? '#22c55e' : pct > 0 ? '#1A1A1A' : '#94a3b8';
              return (
                <div
                  key={rm.roadmapId}
                  className="border border-brand-100 rounded-lg p-5 flex items-center gap-6 bg-surface-muted/50 hover:bg-white transition-colors cursor-pointer group"
                >
                  <SVGDonut percent={pct} color={color} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-brand-900 mb-1 truncate">{rm.domainTitle}</h4>
                    <p className="text-sm text-brand-400">
                      {pct === 100 ? 'Completed' : pct === 0 ? 'Not started' : 'In progress'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-brand-300 group-hover:text-brand-700 transition-colors flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top Companies ─────────────────────────────────── */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-lg font-bold text-brand-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-400" /> Top Companies
          </h2>
        </div>
        {isCompaniesLoading ? (
          <SkeletonList count={3} />
        ) : (
          <>
            <CompanyRankingChart companies={topCompanies} />
            <div className="mt-6 space-y-1">
              {(topCompanies || []).slice(0, 5).map((c, i) => (
                <div key={c.uid} className="flex items-center gap-4 p-3 rounded-lg hover:bg-brand-50 transition-colors">
                  <span className="text-xs font-bold text-brand-400 w-5 text-center">#{i + 1}</span>
                  {c.logoURL ? (
                    <img src={c.logoURL} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-brand-100" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-brand-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {c.companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-900 truncate">{c.companyName}</p>
                    <p className="text-xs text-brand-400 truncate">{c.industry || 'Various'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-brand-700">{c.totalJobs} jobs</p>
                    <p className="text-xs text-brand-400">{c.totalApplications} apps</p>
                  </div>
                  {c.verified && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
