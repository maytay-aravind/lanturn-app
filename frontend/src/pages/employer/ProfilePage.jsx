import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import toast from 'react-hot-toast';
import {
  Building2, Globe, Users, MapPin, Phone, Mail,
  FileText, Save, Briefcase, Crown, Calendar, GitBranch,
  Heart, Cpu, Sparkles, Plus, X, Camera, ShieldCheck,
} from 'lucide-react';

// ── Glassmorphism Section Wrapper ──────────────────────────────
function Section({ icon: Icon, title, subtitle, children, gradient = 'from-brand-50 to-white' }) {
  return (
    <div className="relative group rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-100 transition-all duration-300 overflow-hidden animate-slide-up">
      {/* Subtle top gradient bar */}
      <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
      
      <div className="p-7 sm:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Icon className="h-6 w-6 text-brand-600" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
        </div>
        <div className="pl-0 sm:pl-16 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Premium Form Field ─────────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div className="group/field">
      <label className={`block text-sm font-semibold text-slate-700 mb-2 transition-colors group-focus-within/field:text-brand-600 ${required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}`}>
        {label}
      </label>
      <div className="relative shadow-sm rounded-xl overflow-hidden group-focus-within/field:ring-2 group-focus-within/field:ring-brand-500/20 transition-all">
        {children}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1.5 font-medium">{hint}</p>}
    </div>
  );
}

// ── 2-Col Grid ─────────────────────────────────────────────────
function Grid2({ children }) {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{children}</div>;
}

// ── Save Button Row ────────────────────────────────────────────
function SaveRow({ isPending, onClick }) {
  return (
    <div className="flex justify-end pt-4 border-t border-slate-100/60 mt-6">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="relative overflow-hidden group btn rounded-xl bg-slate-900 text-white px-6 hover:bg-brand-600 shadow-md hover:shadow-brand-500/25 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative flex items-center gap-2">
          {isPending ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
          )}
          {isPending ? 'Saving changes...' : 'Save Section'}
        </span>
      </button>
    </div>
  );
}

// ── Tags Input ─────────────────────────────────────────────────
function TagsInput({ value = [], onChange, placeholder = 'Add item...' }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (!val || value.includes(val) || value.length >= 50) return;
    onChange([...value, val]);
    setInput('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-medium px-3 py-1.5 hover:border-brand-300 hover:bg-brand-50 transition-colors animate-scale-in">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1 bg-slate-50 border-slate-200 focus:bg-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={addTag} className="btn-secondary whitespace-nowrap bg-white hover:bg-slate-50">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function EmployerProfilePage() {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employer', 'me'],
    queryFn: employerService.getMe,
  });

  const p = profile ?? {};
  const [company,       setCompany]       = useState(null);
  const [desc,          setDesc]          = useState(null);
  const [location,      setLocation]      = useState(null);
  const [hrContact,     setHrContact]     = useState(null);
  const [leadership,    setLeadership]    = useState(null);
  const [branches,      setBranches]      = useState(null);
  const [benefits,      setBenefits]      = useState(null);
  const [technologies,  setTechnologies]  = useState(null);
  const [culture,       setCulture]       = useState(null);
  const [contact,       setContact]       = useState(null);

  const getCompany    = () => company    ?? { companyName: p.companyName || '', industry: p.industry || '', companySize: p.companySize || '', website: p.website || '', employeeCount: p.employeeCount ?? '' };
  const getDesc       = () => desc       ?? p.description ?? '';
  const getLocation   = () => location   ?? p.location    ?? {};
  const getHrContact  = () => hrContact  ?? p.hrContact   ?? {};
  const getLeadership = () => leadership ?? { ceo: p.ceo || '', foundedYear: p.foundedYear ?? '', headquarters: p.headquarters || '' };
  const getBranches   = () => branches   ?? p.branches    ?? [];
  const getBenefits   = () => benefits   ?? p.benefits    ?? [];
  const getTechnologies = () => technologies ?? p.technologies ?? [];
  const getCulture    = () => culture    ?? p.companyCulture ?? '';
  const getContact    = () => contact    ?? { email: p.email || '', phone: p.phone || '' };

  const saveMutation = useMutation({
    mutationFn: (body) => employerService.updateMe(body),
    onSuccess: () => {
      toast.success('Profile updated successfully!', { icon: '✨' });
      qc.invalidateQueries({ queryKey: ['employer', 'me'] });
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || err.message || 'Save failed'),
  });

  const handleSave = useCallback((patch) => saveMutation.mutate(patch), [saveMutation]);

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="h-48 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-slate-200 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const co = getCompany();
  const lo = getLocation();
  const hr = getHrContact();
  const ld = getLeadership();
  const ct = getContact();

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in space-y-8">
      
      {/* ── Hero Banner ────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-slate-900/5">
        {/* Abstract Gradient Background */}
        <div className="absolute inset-0 h-40 bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 opacity-90">
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 mix-blend-overlay">
            <svg viewBox="0 0 400 400" className="absolute -top-32 -right-32 w-96 h-96 animate-[spin_60s_linear_infinite]">
              <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.4,-46.5C91,-33.9,97.2,-18.8,95.5,-4.4C93.8,10,84.2,23.6,73.5,35.3C62.8,47,51,56.7,37.8,63.1C24.6,69.5,10,72.6,-4.4,79.5C-18.8,86.4,-33,97.1,-46.1,94.2C-59.2,91.3,-71.2,74.8,-80.4,59.3C-89.6,43.8,-96,29.3,-97.6,14.6C-99.2,0,-96,-14.8,-88.7,-27.1C-81.4,-39.4,-70,-49.2,-57.4,-56.9C-44.8,-64.6,-31,-70.2,-17.1,-72.6C-3.2,-75,10.7,-74.2,24,-73.4C37.3,-72.6,50.6,-71.8,44.7,-76.4Z" transform="translate(200 200)" />
            </svg>
          </div>
        </div>

        <div className="relative pt-24 px-8 pb-8 flex flex-col sm:flex-row gap-6 items-end sm:items-center">
          {/* Logo container */}
          <div className="relative group">
            <div className="h-32 w-32 rounded-2xl bg-white shadow-2xl ring-4 ring-white flex items-center justify-center overflow-hidden z-10 transition-transform duration-300 group-hover:scale-105">
              {p.logoURL ? (
                <img src={p.logoURL} alt="Company Logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-12 w-12 text-slate-300" />
              )}
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-slate-900/80 hover:bg-brand-600 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-lg" title="Change Logo">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Company details */}
          <div className="flex-1 min-w-0 pt-4 sm:pt-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{p.companyName || 'Your Company Name'}</h1>
              {p.verified && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-lg text-slate-600 mt-1 font-medium">
              {[p.industry, p.headquarters && `HQ: ${p.headquarters}`].filter(Boolean).join(' • ') || 'Complete your profile to stand out'}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {p.website && (
                <a href={p.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                  <Globe className="h-4 w-4" /> Website
                </a>
              )}
              {p.employeeCount && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Users className="h-4 w-4" /> {p.employeeCount.toLocaleString()} Employees
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────── */}
      <div className="space-y-8">
        
        {/* Core Info */}
        <Section icon={Briefcase} title="Core Information" subtitle="The basics about your organization" gradient="from-blue-500 to-indigo-500">
          <Grid2>
            <Field label="Company Name" required>
              <input className="input border-slate-200 bg-slate-50 focus:bg-white transition-colors" defaultValue={co.companyName} onChange={e => setCompany({ ...getCompany(), companyName: e.target.value })} placeholder="Acme Inc." />
            </Field>
            <Field label="Industry" required>
              <input className="input border-slate-200 bg-slate-50 focus:bg-white" defaultValue={co.industry} onChange={e => setCompany({ ...getCompany(), industry: e.target.value })} placeholder="e.g. Artificial Intelligence" />
            </Field>
            <Field label="Company Size (Range)">
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input className="input pl-10 border-slate-200 bg-slate-50 focus:bg-white" defaultValue={co.companySize} onChange={e => setCompany({ ...getCompany(), companySize: e.target.value })} placeholder="e.g. 50-200" />
              </div>
            </Field>
            <Field label="Exact Employee Count">
              <input type="number" className="input border-slate-200 bg-slate-50 focus:bg-white" defaultValue={co.employeeCount} onChange={e => setCompany({ ...getCompany(), employeeCount: e.target.value ? Number(e.target.value) : null })} placeholder="142" />
            </Field>
            <Field label="Company Website">
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="url" className="input pl-10 border-slate-200 bg-slate-50 focus:bg-white" defaultValue={co.website} onChange={e => setCompany({ ...getCompany(), website: e.target.value })} placeholder="https://acme.com" />
              </div>
            </Field>
          </Grid2>
          <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ companyName: co.companyName, industry: co.industry, companySize: co.companySize, website: co.website, employeeCount: co.employeeCount || null })} />
        </Section>

        {/* Leadership & Identity */}
        <Section icon={Crown} title="Leadership & Identity" subtitle="Who leads the vision and where it started" gradient="from-amber-400 to-orange-500">
          <Grid2>
            <Field label="CEO / Founder">
              <input className="input border-slate-200 bg-slate-50 focus:bg-white" defaultValue={ld.ceo} onChange={e => setLeadership({ ...getLeadership(), ceo: e.target.value })} placeholder="e.g. Satya Nadella" />
            </Field>
            <Field label="Founded Year">
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="number" className="input pl-10 border-slate-200 bg-slate-50 focus:bg-white" defaultValue={ld.foundedYear} onChange={e => setLeadership({ ...getLeadership(), foundedYear: e.target.value ? Number(e.target.value) : null })} placeholder="2015" />
              </div>
            </Field>
            <Field label="Global Headquarters" hint="Main corporate office location">
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input className="input pl-10 border-slate-200 bg-slate-50 focus:bg-white" defaultValue={ld.headquarters} onChange={e => setLeadership({ ...getLeadership(), headquarters: e.target.value })} placeholder="San Francisco, CA" />
              </div>
            </Field>
          </Grid2>
          <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ ceo: ld.ceo, foundedYear: ld.foundedYear || null, headquarters: ld.headquarters })} />
        </Section>

        {/* Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Section icon={FileText} title="Company Story" subtitle="Your mission and vision" gradient="from-purple-500 to-pink-500">
            <Field label="About Us" hint="Markdown is supported. Make it compelling!">
              <textarea className="textarea border-slate-200 bg-slate-50 focus:bg-white h-48" defaultValue={getDesc()} onChange={e => setDesc(e.target.value)} placeholder="We are a team of passionate innovators..." />
            </Field>
            <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ description: getDesc() })} />
          </Section>
          
          <Section icon={Sparkles} title="Culture & Values" subtitle="What makes your workplace special?" gradient="from-rose-400 to-red-500">
            <Field label="Workplace Culture" hint="Describe your team dynamics and core values">
              <textarea className="textarea border-slate-200 bg-slate-50 focus:bg-white h-48" defaultValue={getCulture()} onChange={e => setCulture(e.target.value)} placeholder="We believe in ownership, transparency, and..." />
            </Field>
            <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ companyCulture: getCulture() })} />
          </Section>
        </div>

        {/* Tags Sections */}
        <Section icon={Heart} title="Benefits & Perks" subtitle="Attract top talent with your offerings" gradient="from-emerald-400 to-teal-500">
          <TagsInput value={getBenefits()} onChange={setBenefits} placeholder="e.g. 401(k) Matching, Remote First, Health Insurance..." />
          <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ benefits: getBenefits() })} />
        </Section>

        <Section icon={Cpu} title="Tech Stack" subtitle="Technologies your engineering team uses" gradient="from-cyan-400 to-blue-500">
          <TagsInput value={getTechnologies()} onChange={setTechnologies} placeholder="e.g. TypeScript, React, PostgreSQL, Docker..." />
          <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ technologies: getTechnologies() })} />
        </Section>
        
        <Section icon={GitBranch} title="Office Locations" subtitle="Where your teams are based globally" gradient="from-indigo-400 to-violet-500">
          <TagsInput value={getBranches()} onChange={setBranches} placeholder="e.g. London, New York, Singapore, Remote..." />
          <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ branches: getBranches() })} />
        </Section>

        {/* Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Section icon={Mail} title="Public Contact" subtitle="General inquiries" gradient="from-slate-400 to-slate-600">
            <Grid2>
              <Field label="Support / General Email">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="email" className="input pl-10 border-slate-200 bg-slate-50 focus:bg-white" defaultValue={ct.email} onChange={e => setContact({ ...getContact(), email: e.target.value })} placeholder="hello@company.com" />
                </div>
              </Field>
              <Field label="Main Phone">
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="tel" className="input pl-10 border-slate-200 bg-slate-50 focus:bg-white" defaultValue={ct.phone} onChange={e => setContact({ ...getContact(), phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
              </Field>
            </Grid2>
            <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ email: ct.email, phone: ct.phone })} />
          </Section>

          <Section icon={Phone} title="HR Contact" subtitle="Visible only to applicants" gradient="from-fuchsia-400 to-pink-600">
            <div className="space-y-5">
              <Field label="Recruiter Name">
                <input className="input border-slate-200 bg-slate-50 focus:bg-white" defaultValue={hr.name} onChange={e => setHrContact({ ...getHrContact(), name: e.target.value })} placeholder="Jane Doe" />
              </Field>
              <Field label="Direct Email">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="email" className="input pl-10 border-slate-200 bg-slate-50 focus:bg-white" defaultValue={hr.email} onChange={e => setHrContact({ ...getHrContact(), email: e.target.value })} placeholder="recruiting@company.com" />
                </div>
              </Field>
            </div>
            <SaveRow isPending={saveMutation.isPending} onClick={() => handleSave({ hrContact: getHrContact() })} />
          </Section>
        </div>

      </div>
    </div>
  );
}