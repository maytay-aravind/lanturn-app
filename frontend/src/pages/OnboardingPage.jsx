import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authService } from '../services/auth.service.js';
import toast from 'react-hot-toast';
import {
  GraduationCap, Briefcase, ChevronRight, ArrowLeft,
  User, Building2, Globe, Phone, MapPin, Code2, Linkedin, Github,
} from 'lucide-react';

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">
        {label}
        <span className="ml-1 text-slate-400 text-xs font-normal">(optional)</span>
      </label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

// ── Role card ─────────────────────────────────────────────────
function RoleCard({ role, selected, onClick, icon: Icon, title, description }) {
  return (
    <button
      type="button"
      onClick={() => onClick(role)}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-150 group ${
        selected
          ? 'border-brand-500 bg-brand-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? 'bg-brand-100' : 'bg-slate-100 group-hover:bg-slate-200'
        }`}>
          <Icon className={`h-5 w-5 ${selected ? 'text-brand-600' : 'text-slate-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${selected ? 'text-brand-700' : 'text-slate-800'}`}>
            {title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
        <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
          selected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
        }`}>
          {selected && (
            <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

export default function OnboardingPage() {
  const { firebaseUser, refreshSession } = useAuth();
  const navigate = useNavigate();

  // step: 'role' | 'profile'
  const [step, setStep] = useState('role');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Student form state ─────────────────────────────────────
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
    skills: '',
    linkedin: '',
    github: '',
    portfolio: '',
    city: '',
  });

  // ── Employer form state ────────────────────────────────────
  const [employerForm, setEmployerForm] = useState({
    companyName: '',
    website: '',
    description: '',
    industry: '',
    companySize: '',
    city: '',
  });

  const handleStudentChange = (e) =>
    setStudentForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEmployerChange = (e) =>
    setEmployerForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── Build nested payload from flat form state ──────────────
  const buildStudentProfile = () => {
    const skills = studentForm.skills
      ? studentForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    return {
      personal: {
        ...(studentForm.name  && { name:  studentForm.name }),
        ...(studentForm.phone && { phone: studentForm.phone }),
        ...(studentForm.city  && { city:  studentForm.city }),
      },
      academic: {
        ...(studentForm.college        && { college:        studentForm.college }),
        ...(studentForm.degree         && { degree:         studentForm.degree }),
        ...(studentForm.branch         && { branch:         studentForm.branch }),
        ...(studentForm.graduationYear && { graduationYear: Number(studentForm.graduationYear) }),
        ...(studentForm.cgpa           && { cgpa:           parseFloat(studentForm.cgpa) }),
      },
      professional: {
        ...(skills.length && { skills }),
      },
      social: {
        ...(studentForm.linkedin  && { linkedin:  studentForm.linkedin }),
        ...(studentForm.github    && { github:    studentForm.github }),
        ...(studentForm.portfolio && { portfolio: studentForm.portfolio }),
      },
    };
  };

  const buildEmployerProfile = () => ({
    ...(employerForm.companyName && { companyName: employerForm.companyName }),
    ...(employerForm.website     && { website:     employerForm.website }),
    ...(employerForm.description && { description: employerForm.description }),
    ...(employerForm.industry    && { industry:    employerForm.industry }),
    ...(employerForm.companySize && { companySize: employerForm.companySize }),
    location: {
      ...(employerForm.city && { city: employerForm.city }),
    },
  });

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    setSubmitting(true);
    try {
      const profile = role === 'student' ? buildStudentProfile() : buildEmployerProfile();
      await authService.onboard({ role, profile });
      await refreshSession();
      toast.success('Profile created!');
      navigate(role === 'student' ? '/dashboard' : '/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Skip — submit with just the role and empty profile
  const handleSkip = async () => {
    if (!role) return;
    setSubmitting(true);
    try {
      await authService.onboard({ role, profile: {} });
      await refreshSession();
      toast.success('Profile created! You can complete it later.');
      navigate(role === 'student' ? '/dashboard' : '/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!firebaseUser) return null;

  // ── Step 1: Role selection ─────────────────────────────────
  if (step === 'role') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="card p-8 w-full max-w-md animate-fade-in">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Welcome! 👋</h1>
            <p className="text-slate-500 mt-1 text-sm">
              First, tell us who you are. This can't be changed later.
            </p>
          </div>

          <div className="space-y-3">
            <RoleCard
              role="student"
              selected={role === 'student'}
              onClick={setRole}
              icon={GraduationCap}
              title="I'm a Student"
              description="Looking for jobs, internships, and career opportunities."
            />
            <RoleCard
              role="employer"
              selected={role === 'employer'}
              onClick={setRole}
              icon={Briefcase}
              title="I'm an Employer"
              description="Hiring students and early-career professionals."
            />
          </div>

          <button
            type="button"
            disabled={!role || submitting}
            onClick={() => setStep('profile')}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Profile details ────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="card p-8 w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setStep('role')}
            className="btn-ghost btn-sm p-1.5"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {role === 'student' ? 'Your Profile' : 'Company Details'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              All fields are optional — you can fill these in later.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Student fields ──────────────────────────── */}
          {role === 'student' && (
            <>
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Personal</span>
              </div>
              <Grid2>
                <Field label="Full Name">
                  <input name="name" type="text" placeholder="Asha Kumar"
                    value={studentForm.name} onChange={handleStudentChange} className="input" />
                </Field>
                <Field label="Phone">
                  <input name="phone" type="tel" placeholder="+91 98765 43210"
                    value={studentForm.phone} onChange={handleStudentChange} className="input" />
                </Field>
              </Grid2>

              <div className="flex items-center gap-2 pb-1 border-b border-slate-100 mt-2">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Academic</span>
              </div>
              <Grid2>
                <Field label="College / University">
                  <input name="college" type="text" placeholder="IIT Madras"
                    value={studentForm.college} onChange={handleStudentChange} className="input" />
                </Field>
                <Field label="Degree">
                  <input name="degree" type="text" placeholder="B.Tech"
                    value={studentForm.degree} onChange={handleStudentChange} className="input" />
                </Field>
                <Field label="Branch / Major">
                  <input name="branch" type="text" placeholder="Computer Science"
                    value={studentForm.branch} onChange={handleStudentChange} className="input" />
                </Field>
                <Field label="Graduation Year">
                  <input name="graduationYear" type="number" placeholder="2026"
                    min={2000} max={2035}
                    value={studentForm.graduationYear} onChange={handleStudentChange} className="input" />
                </Field>
                <Field label="CGPA" hint="Out of 10">
                  <input name="cgpa" type="number" step="0.01" min={0} max={10}
                    placeholder="8.5"
                    value={studentForm.cgpa} onChange={handleStudentChange} className="input" />
                </Field>
                <Field label="City">
                  <input name="city" type="text" placeholder="Bangalore"
                    value={studentForm.city} onChange={handleStudentChange} className="input" />
                </Field>
              </Grid2>

              <div className="flex items-center gap-2 pb-1 border-b border-slate-100 mt-2">
                <Code2 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Skills &amp; Links</span>
              </div>
              <Field label="Skills" hint="Comma-separated, e.g. React, Node.js, Python">
                <input name="skills" type="text" placeholder="React, Node.js, Python"
                  value={studentForm.skills} onChange={handleStudentChange} className="input" />
              </Field>
              <Grid2>
                <Field label="LinkedIn">
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input name="linkedin" type="url" placeholder="https://linkedin.com/in/..."
                      value={studentForm.linkedin} onChange={handleStudentChange}
                      className="input pl-9" />
                  </div>
                </Field>
                <Field label="GitHub">
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input name="github" type="url" placeholder="https://github.com/..."
                      value={studentForm.github} onChange={handleStudentChange}
                      className="input pl-9" />
                  </div>
                </Field>
                <Field label="Portfolio">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input name="portfolio" type="url" placeholder="https://mysite.dev"
                      value={studentForm.portfolio} onChange={handleStudentChange}
                      className="input pl-9" />
                  </div>
                </Field>
              </Grid2>
            </>
          )}

          {/* ── Employer fields ─────────────────────────── */}
          {role === 'employer' && (
            <>
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</span>
              </div>
              <Grid2>
                <Field label="Company Name">
                  <input name="companyName" type="text" placeholder="Acme Inc."
                    value={employerForm.companyName} onChange={handleEmployerChange} className="input" />
                </Field>
                <Field label="Industry">
                  <input name="industry" type="text" placeholder="Technology"
                    value={employerForm.industry} onChange={handleEmployerChange} className="input" />
                </Field>
                <Field label="Company Size">
                  <input name="companySize" type="text" placeholder="50–200"
                    value={employerForm.companySize} onChange={handleEmployerChange} className="input" />
                </Field>
                <Field label="Website">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input name="website" type="url" placeholder="https://acme.com"
                      value={employerForm.website} onChange={handleEmployerChange}
                      className="input pl-9" />
                  </div>
                </Field>
                <Field label="City">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input name="city" type="text" placeholder="Bangalore"
                      value={employerForm.city} onChange={handleEmployerChange}
                      className="input pl-9" />
                  </div>
                </Field>
              </Grid2>
              <Field label="Company Description">
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Tell candidates about your company..."
                  value={employerForm.description}
                  onChange={handleEmployerChange}
                  className="textarea"
                />
              </Field>
            </>
          )}

          {/* ── Actions ─────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="btn-secondary flex-1"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Creating...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}