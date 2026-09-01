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
import { Briefcase, CheckCircle2, ChevronRight, Clock, Star, Trophy, Target, TrendingUp } from 'lucide-react';
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

function DonutCard({ title, percent, color, icon }) {
  const data = [
    { name: 'Completed', value: percent },
    { name: 'Remaining', value: 100 - percent },
  ];
  return (
    <div className="card p-4 flex flex-col items-center">
      <p className="text-sm font-semibold text-brand-900 mb-2">{title}</p>
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={48}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-brand-900">{percent}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-brand-400">
        {icon}
        <span>{percent === 100 ? 'Completed' : percent === 0 ? 'Not started' : 'In progress'}</span>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
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
                  <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-sm">
                    <span className="font-medium text-brand-900">{d.name}</span>
                    <span className="text-brand-400 ml-2">{d.value} ({Math.round((d.value / total) * 100)}%)</span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3">
        {pieData.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[d.status] }} />
            <span className="text-sm text-brand-700 font-medium">{d.name}</span>
            <span className="text-sm text-brand-400">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-sm">
                  <p className="font-medium text-brand-900">{full?.companyName || d.name}</p>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">
            {t('studentDash.welcomeBack', { name: displayName })}
          </h1>
          <p className="text-brand-400 mt-1">{t('studentDash.overview')}</p>
        </div>
        <Link to="/jobs" className="btn-primary flex items-center gap-2">
          <Target className="h-4 w-4" />
          {t('studentDash.findJobs')}
        </Link>
      </div>

      {isProfileLoading ? (
        <SkeletonProfile />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-brand-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-400">{t('studentDash.applications')}</p>
                <p className="text-2xl font-bold text-brand-900">{totalApps}</p>
              </div>
            </div>
            <Link to="/applications" className="text-sm font-medium text-brand-900 hover:text-brand-700 mt-4 flex items-center gap-1">
              {t('studentDash.viewApplications')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-brand-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-400">{t('studentDash.profileStrength')}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-lg font-bold text-brand-900">{completion}%</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${completion === 100 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                    {completion === 100 ? t('studentDash.complete') : t('studentDash.needsInfo')}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
            </div>
          </div>

          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Star className="h-5 w-5 text-brand-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-400">{t('studentDash.topSkills')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(profile?.professional?.skills || []).length > 0 ? (
                (profile.professional.skills.slice(0, 5).map((s) => (
                  <span key={s} className="badge-default">{s}</span>
                )))
              ) : (
                <span className="text-sm text-brand-400">{t('studentDash.noSkillsYet')}</span>
              )}
              {(profile?.professional?.skills?.length || 0) > 5 && (
                <span className="badge-default">+{profile.professional.skills.length - 5}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Career Aisle Progress */}
      {enrolledRoadmaps.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-400" /> Career Aisle Progress
            </h2>
            <Link to="/career" className="text-sm font-medium text-brand-900 hover:text-brand-700">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {enrolledRoadmaps.map((rm) => (
              <DonutCard
                key={rm.roadmapId}
                title={rm.domainTitle}
                percent={rm.percentComplete ?? 0}
                color={rm.percentComplete === 100 ? '#22c55e' : rm.percentComplete > 0 ? '#6366f1' : '#94a3b8'}
                icon={<CheckCircle2 className="h-3 w-3" />}
              />
            ))}
          </div>
        </div>
      )}

      {/* Application Track Record */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-400" /> Application Track Record
          </h2>
        </div>
        <ApplicationPieChart allApps={allApplications} />
      </div>

      {/* Top Companies */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-400" /> Top Companies
          </h2>
        </div>
        {isCompaniesLoading ? (
          <SkeletonList count={3} />
        ) : (
          <>
            <CompanyRankingChart companies={topCompanies} />
            <div className="mt-4 space-y-2">
              {(topCompanies || []).slice(0, 5).map((c, i) => (
                <div key={c.uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-bold text-brand-400 w-5 text-center">#{i + 1}</span>
                  {c.logoURL ? (
                    <img src={c.logoURL} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-slate-100" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
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

      {/* Recent Applications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-400" /> {t('studentDash.recentApplications')}
          </h2>
          <Link to="/applications" className="text-sm font-medium text-brand-900 hover:text-brand-700">{t('studentDash.viewAll')}</Link>
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
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="card-hover p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-900">{app.jobTitle || 'Job'}</p>
                  <p className="text-sm text-brand-400">{app.companyName || 'Company'} · {timeAgo(app.createdAt)}</p>
                </div>
                <span className={`badge ${
                  app.status === 'accepted' ? 'badge-green' :
                  app.status === 'rejected' ? 'badge-red' :
                  app.status === 'shortlisted' ? 'badge-purple' :
                  'badge-yellow'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
