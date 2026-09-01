import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/student.service.js';
import { applicationService } from '../../services/application.service.js';
import { Link } from 'react-router-dom';
import { SkeletonList, SkeletonProfile } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Briefcase, CheckCircle2, ChevronRight, Clock, Star, Trophy, Target } from 'lucide-react';
import { timeAgo } from '../../lib/utils.js';

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

  const applications = appsData?.items ?? [];
  const totalApps = appsData?.meta?.totalItems ?? applications.length;

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
        <Link to="/job-search" className="btn-primary flex items-center gap-2">
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