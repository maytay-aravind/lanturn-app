import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/student.service.js';
import { uploadService } from '../../services/upload.service.js';
import { magicalService } from '../../services/magical.service.js';
import { SkillsInput } from '../../components/ui/SkillsInput.jsx';
import { SkeletonProfile } from '../../components/ui/Skeleton.jsx';
import toast from 'react-hot-toast';
import {
  User, GraduationCap, Briefcase, Link2, Upload,
  Save, Camera, FileText, CheckCircle2, ExternalLink, Loader2, Sparkles,
} from 'lucide-react';

// ── Inline SVG brand icons ────────────────────────────────────
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

// ── Section wrapper ───────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-6 space-y-4 animate-slide-up">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-brand-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-brand-600" />
        </div>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Form field ────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

// ── 2-col grid ────────────────────────────────────────────────
function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

export default function ProfilePage() {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const resumeRef = useRef(null);
  const [uploadPct, setUploadPct] = useState(null);
  const [resumePct, setResumePct] = useState(null);
  const [viewingResume, setViewingResume] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student', 'me'],
    queryFn: studentService.getMe,
  });

  // ── Local form state (all sections) ──────────────────────
  const p = profile ?? {};
  const [personal,     setPersonal]     = useState(null);
  const [academic,     setAcademic]     = useState(null);
  const [professional, setProfessional] = useState(null);
  const [social,       setSocial]       = useState(null);

  const getPersonal     = () => personal     ?? p.personal     ?? {};
  const getAcademic     = () => academic     ?? p.academic     ?? {};
  const getProfessional = () => professional ?? p.professional ?? {};
  const getSocial       = () => social       ?? p.social       ?? {};

  // ── Single save — sends all sections at once ──────────────
  const saveMutation = useMutation({
    mutationFn: (body) => studentService.updateMe(body),
    onSuccess: () => {
      toast.success('Profile saved!');
      qc.invalidateQueries({ queryKey: ['student', 'me'] });
    },
    onError: (err) => {
      const details = err.details;
      if (details?.length) {
        toast.error(`Validation: ${details.map((d) => d.message).join(', ')}`);
      } else {
        toast.error(err.message || 'Save failed');
      }
    },
  });

  const handleSaveAll = () => {
    saveMutation.mutate({
      personal:     getPersonal(),
      academic:     getAcademic(),
      professional: getProfessional(),
      social:       getSocial(),
    });
  };

  // ── Photo upload ──────────────────────────────────────────
  const handlePhotoChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2 MB');
      return;
    }
    try {
      setUploadPct(0);
      await uploadService.uploadFile(file, 'profilePhoto', setUploadPct);
      toast.success('Photo updated!');
      qc.invalidateQueries({ queryKey: ['student', 'me'] });
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadPct(null);
    }
  }, [qc]);

  // ── Resume upload ─────────────────────────────────────────
  const handleResumeChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.type !== 'application/pdf') {
      toast.error('Resume must be a PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5 MB');
      return;
    }
    try {
      setResumePct(0);
      await uploadService.uploadFile(file, 'resume', setResumePct);
      toast.success('Resume uploaded! Click "Auto-fill from Resume" to populate your profile.');
      qc.invalidateQueries({ queryKey: ['student', 'me'] });
    } catch (err) {
      toast.error(err.message || 'Resume upload failed');
    } finally {
      setResumePct(null);
    }
  }, [qc]);

  // ── Resume view ───────────────────────────────────────────
  const handleViewResume = useCallback(async () => {
    setViewingResume(true);
    try {
      const { signedUrl } = await studentService.getResumeUrl();
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message || 'Could not open resume');
    } finally {
      setViewingResume(false);
    }
  }, []);

  // ── Resume auto-fill ──────────────────────────────────────
  const handleExtract = useCallback(async () => {
    setExtracting(true);
    const toastId = toast.loading('Reading your resume...');
    try {
      const extracted = await magicalService.extractResume();
      // Merge extracted data into local form state (don't overwrite fields
      // the user has already manually edited in this session)
      if (extracted.personal  && Object.keys(extracted.personal).length)
        setPersonal((prev) => ({ ...(prev ?? p.personal ?? {}), ...extracted.personal }));
      if (extracted.academic  && Object.keys(extracted.academic).length)
        setAcademic((prev) => ({ ...(prev ?? p.academic ?? {}), ...extracted.academic }));
      if (extracted.professional?.skills?.length)
        setProfessional((prev) => ({ ...(prev ?? p.professional ?? {}), ...extracted.professional }));
      if (extracted.social    && Object.keys(extracted.social).length)
        setSocial((prev) => ({ ...(prev ?? p.social ?? {}), ...extracted.social }));

      toast.success('Profile fields filled from resume! Review and save.', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Could not extract resume data', { id: toastId });
    } finally {
      setExtracting(false);
    }
  }, [p]);

  if (isLoading) return <SkeletonProfile />;

  const per = getPersonal();
  const aca = getAcademic();
  const pro = getProfessional();
  const soc = getSocial();

  // Social link helpers
  const githubUrl   = soc.github   || '';
  const linkedinUrl = soc.linkedin || '';

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Keep your profile up-to-date to get better matches</p>
        </div>
      </div>

      {/* ── Avatar + social links card ───────────────────── */}
      <div className="card p-5 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {p.profilePhotoURL ? (
            <img src={p.profilePhotoURL} alt="avatar" className="avatar h-20 w-20" />
          ) : (
            <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-brand-700 bg-brand-50 ring-2 ring-brand-100">
              {per.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white ring-2 ring-brand-500 flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-lg">{per.name || 'Your Name'}</p>
          <p className="text-sm text-slate-500">{p.uid ? `Student · ${aca.college || 'College'}` : ''}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {p.role          && <span className="badge-brand">{p.role}</span>}
            {aca.graduationYear && <span className="badge-default">Class of {aca.graduationYear}</span>}
            {p.resumeUrl     && <span className="badge-green"><CheckCircle2 className="h-3 w-3" /> Resume</span>}

            {/* GitHub link — grey if no URL */}
            <a
              href={githubUrl || '#'}
              target={githubUrl ? '_blank' : '_self'}
              rel="noreferrer"
              onClick={!githubUrl ? (e) => e.preventDefault() : undefined}
              title={githubUrl ? 'View GitHub profile' : 'Add GitHub URL in Social section'}
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                githubUrl
                  ? 'bg-slate-900 text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <GitHubIcon className="h-3 w-3" />
              GitHub
            </a>

            {/* LinkedIn link — grey if no URL */}
            <a
              href={linkedinUrl || '#'}
              target={linkedinUrl ? '_blank' : '_self'}
              rel="noreferrer"
              onClick={!linkedinUrl ? (e) => e.preventDefault() : undefined}
              title={linkedinUrl ? 'View LinkedIn profile' : 'Add LinkedIn URL in Social section'}
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                linkedinUrl
                  ? 'bg-[#0A66C2] text-white hover:bg-[#004182]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <LinkedInIcon className="h-3 w-3" />
              LinkedIn
            </a>
          </div>
        </div>

        {uploadPct !== null && (
          <div className="w-24 flex-shrink-0">
            <p className="text-xs text-slate-400 mb-1 text-center">{uploadPct}%</p>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${uploadPct}%` }} /></div>
          </div>
        )}
      </div>

      {/* ── Resume section — FIRST ───────────────────────── */}
      <Section icon={FileText} title="Resume">
        {/* Uploaded state */}
        {p.resumeUrl && resumePct === null && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-800">Resume uploaded</p>
              <p className="text-xs text-emerald-600 mt-0.5">PDF · Click View to open</p>
            </div>
            <button
              onClick={handleViewResume}
              disabled={viewingResume}
              className="btn-secondary btn-sm flex items-center gap-1.5 flex-shrink-0"
            >
              {viewingResume ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              {viewingResume ? 'Opening...' : 'View'}
            </button>
          </div>
        )}

        {/* No resume yet + not uploading */}
        {!p.resumeUrl && resumePct === null && (
          <div className="dropzone" onClick={() => resumeRef.current?.click()}>
            <Upload className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">Drop your resume here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF only · Max 5 MB</p>
          </div>
        )}

        {/* Upload progress */}
        {resumePct !== null && (
          <div className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">Uploading resume...</span>
              <span>{resumePct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${resumePct}%` }} />
            </div>
          </div>
        )}

        <input ref={resumeRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeChange} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => resumeRef.current?.click()}
            disabled={resumePct !== null}
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            {p.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
          </button>

          {/* Auto-fill button — only shown when a resume exists */}
          {p.resumeUrl && (
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              {extracting
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Sparkles className="h-3.5 w-3.5" />}
              {extracting ? 'Extracting...' : 'Auto-fill from Resume'}
            </button>
          )}

          {p.resumeUrl && (
            <span className="text-xs text-slate-400">
              {p.resumeUrl ? 'Uploading a new PDF replaces the current one' : ''}
            </span>
          )}
        </div>
      </Section>

      {/* ── Personal Info ─────────────────────────────────── */}
      <Section icon={User} title="Personal Information">
        <Grid2>
          <Field label="Full Name">
            <input
              key={`name-${per.name}`}
              className="input"
              defaultValue={per.name}
              onChange={(e) => setPersonal({ ...getPersonal(), name: e.target.value })}
              placeholder="Asha Kumar"
            />
          </Field>
          <Field label="Phone">
            <input
              key={`phone-${per.phone}`}
              className="input"
              defaultValue={per.phone}
              onChange={(e) => setPersonal({ ...getPersonal(), phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="City">
            <input
              key={`city-${per.city}`}
              className="input"
              defaultValue={per.city}
              onChange={(e) => setPersonal({ ...getPersonal(), city: e.target.value })}
              placeholder="Bangalore"
            />
          </Field>
          <Field label="State">
            <input
              key={`state-${per.state}`}
              className="input"
              defaultValue={per.state}
              onChange={(e) => setPersonal({ ...getPersonal(), state: e.target.value })}
              placeholder="Karnataka"
            />
          </Field>
        </Grid2>
      </Section>

      {/* ── Academic ──────────────────────────────────────── */}
      <Section icon={GraduationCap} title="Academic Details">
        <Grid2>
          <Field label="College / University">
            <input
              key={`college-${aca.college}`}
              className="input"
              defaultValue={aca.college}
              onChange={(e) => setAcademic({ ...getAcademic(), college: e.target.value })}
              placeholder="IIT Madras"
            />
          </Field>
          <Field label="Degree">
            <input
              key={`degree-${aca.degree}`}
              className="input"
              defaultValue={aca.degree}
              onChange={(e) => setAcademic({ ...getAcademic(), degree: e.target.value })}
              placeholder="B.Tech"
            />
          </Field>
          <Field label="Branch / Major">
            <input
              key={`branch-${aca.branch}`}
              className="input"
              defaultValue={aca.branch}
              onChange={(e) => setAcademic({ ...getAcademic(), branch: e.target.value })}
              placeholder="Computer Science"
            />
          </Field>
          <Field label="Graduation Year">
            <input
              key={`gradYear-${aca.graduationYear}`}
              type="number"
              className="input"
              defaultValue={aca.graduationYear}
              min={2000}
              max={2035}
              onChange={(e) => setAcademic({ ...getAcademic(), graduationYear: Number(e.target.value) })}
              placeholder="2025"
            />
          </Field>
          <Field label="CGPA / GPA" hint="Out of 10">
            <input
              key={`cgpa-${aca.cgpa}`}
              type="number"
              step="0.01"
              min={0}
              max={10}
              className="input"
              defaultValue={aca.cgpa}
              onChange={(e) => setAcademic({ ...getAcademic(), cgpa: parseFloat(e.target.value) })}
              placeholder="8.5"
            />
          </Field>
        </Grid2>
      </Section>

      {/* ── Professional ──────────────────────────────────── */}
      <Section icon={Briefcase} title="Professional Details">
        <Field label="Skills" hint="Type and press Enter or comma to add">
          <SkillsInput
            value={pro.skills ?? []}
            onChange={(skills) => setProfessional({ ...getProfessional(), skills })}
          />
        </Field>
      </Section>

      {/* ── Social Links ──────────────────────────────────── */}
      <Section icon={Link2} title="Social & Portfolio">
        <Grid2>
          <Field label="GitHub">
            <div className="relative">
              <GitHubIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                key={`github-${soc.github}`}
                className="input pl-9"
                defaultValue={soc.github}
                onChange={(e) => setSocial({ ...getSocial(), github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
          </Field>
          <Field label="LinkedIn">
            <div className="relative">
              <LinkedInIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                key={`linkedin-${soc.linkedin}`}
                className="input pl-9"
                defaultValue={soc.linkedin}
                onChange={(e) => setSocial({ ...getSocial(), linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </Field>
          <Field label="Portfolio / Website">
            <input
              key={`portfolio-${soc.portfolio}`}
              className="input"
              defaultValue={soc.portfolio}
              onChange={(e) => setSocial({ ...getSocial(), portfolio: e.target.value })}
              placeholder="https://myportfolio.dev"
            />
          </Field>
        </Grid2>
      </Section>

      {/* ── Single Save button at the bottom ─────────────── */}
      <div className="card p-4 flex items-center justify-between gap-4 sticky bottom-4 z-10 bg-white/90 backdrop-blur-sm">
        <p className="text-xs text-slate-500">All changes are saved at once</p>
        <button
          onClick={handleSaveAll}
          disabled={saveMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          {saveMutation.isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Save className="h-4 w-4" />}
          {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}