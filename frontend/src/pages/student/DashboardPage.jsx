import { useAuth } from '../../contexts/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/student.service.js';
import { applicationService } from '../../services/application.service.js';
import { Link } from 'react-router-dom';
import { SkeletonList, SkeletonProfile } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import {
  Briefcase, CheckCircle2, ChevronRight, Clock, Star, Trophy, Target,
  User, GraduationCap, MapPin, Phone, Pencil, ExternalLink,
} from 'lucide-react';
import { timeAgo } from '../../lib/utils.js';

// ── Inline SVG brand icons (same as ProfilePage) ──────────────
function GitHubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ── Detail row helper ─────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-800 truncate">{value}</span>
    </div>
  );
}

export default function StudentDashboard() {
  const { session } = useAuth();

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

  const per = profile?.personal ?? {};
  const aca = profile?.academic ?? {};
  const pro = profile?.professional ?? {};
  const soc = profile?.social ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {per.name || session?.email?.split('@')[0] || 'Student'} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here is your career placement overview</p>
        </div>
        <Link to="/job-search" className="btn-primary flex items-center gap-2">
          <Target className="h-4 w-4" />
          Find Jobs
        </Link>
      </div>

      {/* ── Profile Card ──────────────────────────────────── */}
      {isProfileLoading ? (
        <SkeletonProfile />
      ) : (
        <div className="card overflow-hidden animate-slide-up">
          {/* Gradient banner */}
          <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}>
            <Link
              to="/profile"
              id="dashboard-edit-profile-btn"
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 hover:bg-white/30 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Edit Profile
            </Link>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar overlapping the banner */}
            <div className="flex items-end gap-4 -mt-10">
              <div className="relative flex-shrink-0">
                {profile?.profilePhotoURL ? (
                  <img src={profile.profilePhotoURL} alt="avatar" className="avatar h-20 w-20 ring-4 ring-white shadow-lg" />
                ) : (
                  <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-brand-700 bg-brand-50 ring-4 ring-white shadow-lg">
                    {per.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="font-bold text-slate-900 text-lg leading-tight">{per.name || 'Your Name'}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {[aca.degree, aca.branch].filter(Boolean).join(' in ') || 'Student'}
                  {aca.college ? ` · ${aca.college}` : ''}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile?.role && <span className="badge-brand">{profile.role}</span>}
              {aca.graduationYear && <span className="badge-default">Class of {aca.graduationYear}</span>}
              {aca.cgpa && <span className="badge-blue">CGPA: {aca.cgpa}</span>}
              {profile?.resumeUrl && <span className="badge-green"><CheckCircle2 className="h-3 w-3" /> Resume</span>}
            </div>

            {/* Divider */}
            <div className="divider my-4" />

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              <DetailRow icon={User} label="Name" value={per.name} />
              <DetailRow icon={Phone} label="Phone" value={per.phone} />
              <DetailRow icon={MapPin} label="Location" value={[per.city, per.state].filter(Boolean).join(', ')} />
              <DetailRow icon={GraduationCap} label="College" value={aca.college} />
              <DetailRow icon={GraduationCap} label="Degree" value={[aca.degree, aca.branch].filter(Boolean).join(' – ')} />
              <DetailRow icon={GraduationCap} label="Graduation" value={aca.graduationYear ? `${aca.graduationYear}` : null} />
              <DetailRow icon={Star} label="CGPA" value={aca.cgpa ? `${aca.cgpa} / 10` : null} />
            </div>

            {/* Skills */}
            {(pro.skills?.length ?? 0) > 0 && (
              <>
                <div className="divider my-4" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pro.skills.map((s) => (
                      <span key={s} className="pill">{s}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Social links */}
            {(soc.github || soc.linkedin || soc.portfolio) && (
              <>
                <div className="divider my-4" />
                <div className="flex flex-wrap gap-2">
                  {soc.github && (
                    <a href={soc.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                      <GitHubIcon className="h-3.5 w-3.5" /> GitHub <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  )}
                  {soc.linkedin && (
                    <a href={soc.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors">
                      <LinkedInIcon className="h-3.5 w-3.5" /> LinkedIn <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  )}
                  {soc.portfolio && (
                    <a href={soc.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                      <ExternalLink className="h-3 w-3" /> Portfolio
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────── */}
      {!isProfileLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Applications</p>
                <p className="text-2xl font-bold text-slate-900">{totalApps}</p>
              </div>
            </div>
            <Link to="/applications" className="text-sm font-medium text-brand-600 hover:text-brand-700 mt-4 flex items-center gap-1">
              View applications <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">Profile Strength</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-lg font-bold text-slate-900">{completion}%</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${completion === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {completion === 100 ? 'Complete' : 'Needs info'}
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
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Top Skills</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(profile?.professional?.skills || []).length > 0 ? (
                (profile.professional.skills.slice(0, 5).map((s) => (
                  <span key={s} className="badge-default bg-slate-100">{s}</span>
                )))
              ) : (
                <span className="text-sm text-slate-400">No skills added yet</span>
              )}
              {(profile?.professional?.skills?.length || 0) > 5 && (
                <span className="badge-default bg-slate-100">+{profile.professional.skills.length - 5}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" /> Recent Applications
          </h2>
          <Link to="/applications" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>
        </div>

        {isAppsLoading ? (
          <SkeletonList count={3} />
        ) : applications.length === 0 ? (
          <EmptyState
            icon="document"
            title="No applications yet"
            description="Start exploring jobs and send out your first application"
            action={{ label: 'Browse Jobs', onClick: () => window.location.href = '/jobs' }}
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="card-hover p-4 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{app.jobTitle || 'Job'}</p>
                  <p className="text-sm text-slate-500">{app.companyName || 'Company'} · {timeAgo(app.createdAt)}</p>
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