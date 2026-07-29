import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/student.service.js';
import { uploadService } from '../../services/upload.service.js';
import { SkillsInput } from '../../components/ui/SkillsInput.jsx';
import { SkeletonProfile } from '../../components/ui/Skeleton.jsx';
import toast from 'react-hot-toast';
import {
  User, GraduationCap, Briefcase, Link, Upload,
  Save, Camera, FileText, CheckCircle2, ExternalLink, Plus, Trash2
} from 'lucide-react';

// ── Section wrapper ──────────────────────────────────────────
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

// ── Form field ───────────────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className={`label ${required ? 'label-required' : ''}`}>{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

// ── 2-col grid ───────────────────────────────────────────────
function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

export default function ProfilePage() {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const resumeRef = useRef(null);
  const [uploadPct, setUploadPct] = useState(null);
  const [resumePct, setResumePct] = useState(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student', 'me'],
    queryFn: studentService.getMe,
  });

  // ── Derived state ─────────────────────────────────────────
  const p = profile ?? {};
  const [personal, setPersonal] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [social, setSocial] = useState(null);

  // Only initialise from profile once
  const getPersonal = () => personal ?? p.personal ?? {};
  const getAcademic = () => academic ?? p.academic ?? {};
  const getProfessional = () => professional ?? p.professional ?? {};
  const getSocial = () => social ?? p.social ?? {};

  // ── Save mutation ─────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (body) => studentService.updateMe(body),
    onSuccess: () => {
      toast.success('Profile saved!');
      qc.invalidateQueries({ queryKey: ['student', 'me'] });
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || err.message || 'Save failed'),
  });

  const handleSave = (section, data) => {
    saveMutation.mutate({ [section]: data });
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
      toast.success('Resume uploaded!');
      qc.invalidateQueries({ queryKey: ['student', 'me'] });
    } catch (err) {
      toast.error(err.message || 'Resume upload failed');
    } finally {
      setResumePct(null);
    }
  }, [qc]);

  if (isLoading) return <SkeletonProfile />;

  const per = getPersonal();
  const aca = getAcademic();
  const pro = getProfessional();
  const soc = getSocial();

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Keep your profile up-to-date to get better matches</p>
      </div>

      {/* ── Avatar card ─────────────────────────────────── */}
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
          <div className="flex flex-wrap gap-1.5 mt-2">
            {p.role && <span className="badge-brand">{p.role}</span>}
            {aca.graduationYear && <span className="badge-default">Class of {aca.graduationYear}</span>}
            {p.resumeUrl && <span className="badge-green"><CheckCircle2 className="h-3 w-3" /> Resume uploaded</span>}
          </div>
        </div>

        {uploadPct !== null && (
          <div className="w-24">
            <p className="text-xs text-slate-400 mb-1 text-center">{uploadPct}%</p>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${uploadPct}%` }} /></div>
          </div>
        )}
      </div>

      {/* ── Personal Info ────────────────────────────────── */}
      <Section icon={User} title="Personal Information">
        <Grid2>
          <Field label="Full Name" required>
            <input
              className="input"
              defaultValue={per.name}
              onChange={(e) => setPersonal({ ...getPersonal(), name: e.target.value })}
              placeholder="Asha Kumar"
            />
          </Field>
          <Field label="Phone">
            <input
              className="input"
              defaultValue={per.phone}
              onChange={(e) => setPersonal({ ...getPersonal(), phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="City">
            <input
              className="input"
              defaultValue={per.city}
              onChange={(e) => setPersonal({ ...getPersonal(), city: e.target.value })}
              placeholder="Bangalore"
            />
          </Field>
          <Field label="State">
            <input
              className="input"
              defaultValue={per.state}
              onChange={(e) => setPersonal({ ...getPersonal(), state: e.target.value })}
              placeholder="Karnataka"
            />
          </Field>
        </Grid2>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSave('personal', getPersonal())}
            disabled={saveMutation.isPending}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Section>

      {/* ── Academic ─────────────────────────────────────── */}
      <Section icon={GraduationCap} title="Academic Details">
        <Grid2>
          <Field label="College / University">
            <input
              className="input"
              defaultValue={aca.college}
              onChange={(e) => setAcademic({ ...getAcademic(), college: e.target.value })}
              placeholder="IIT Madras"
            />
          </Field>
          <Field label="Degree">
            <input
              className="input"
              defaultValue={aca.degree}
              onChange={(e) => setAcademic({ ...getAcademic(), degree: e.target.value })}
              placeholder="B.Tech"
            />
          </Field>
          <Field label="Branch / Major">
            <input
              className="input"
              defaultValue={aca.branch}
              onChange={(e) => setAcademic({ ...getAcademic(), branch: e.target.value })}
              placeholder="Computer Science"
            />
          </Field>
          <Field label="Graduation Year">
            <input
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
        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSave('academic', getAcademic())}
            disabled={saveMutation.isPending}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      </Section>

      {/* ── Professional ─────────────────────────────────── */}
      <Section icon={Briefcase} title="Professional Details">
        <Field label="Skills" hint="Type and press Enter or comma to add">
          <SkillsInput
            value={pro.skills ?? []}
            onChange={(skills) => setProfessional({ ...getProfessional(), skills })}
          />
        </Field>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSave('professional', getProfessional())}
            disabled={saveMutation.isPending}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      </Section>

      {/* ── Social Links ─────────────────────────────────── */}
      <Section icon={Link} title="Social & Portfolio">
        <Grid2>
          <Field label="GitHub">
            <input
              className="input"
              defaultValue={soc.github}
              onChange={(e) => setSocial({ ...getSocial(), github: e.target.value })}
              placeholder="https://github.com/username"
            />
          </Field>
          <Field label="LinkedIn">
            <input
              className="input"
              defaultValue={soc.linkedin}
              onChange={(e) => setSocial({ ...getSocial(), linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
          </Field>
          <Field label="Portfolio / Website">
            <input
              className="input"
              defaultValue={soc.portfolio}
              onChange={(e) => setSocial({ ...getSocial(), portfolio: e.target.value })}
              placeholder="https://myportfolio.dev"
            />
          </Field>
        </Grid2>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSave('social', getSocial())}
            disabled={saveMutation.isPending}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      </Section>

      {/* ── Resume ───────────────────────────────────────── */}
      <Section icon={FileText} title="Resume">
        {p.resumeUrl ? (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-800">Resume uploaded</p>
              <p className="text-xs text-emerald-600 truncate">{p.resumeUrl}</p>
            </div>
            <a
              href={p.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <ExternalLink className="h-3 w-3" /> View
            </a>
          </div>
        ) : (
          <div className="dropzone" onClick={() => resumeRef.current?.click()}>
            <Upload className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">Drop your resume here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF only · Max 5 MB</p>
          </div>
        )}

        {resumePct !== null && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Uploading...</span>
              <span>{resumePct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${resumePct}%` }} />
            </div>
          </div>
        )}

        <input ref={resumeRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeChange} />

        <button
          onClick={() => resumeRef.current?.click()}
          className="btn-secondary btn-sm flex items-center gap-1.5 w-fit"
        >
          <Upload className="h-3.5 w-3.5" />
          {p.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
        </button>
      </Section>
    </div>
  );
}