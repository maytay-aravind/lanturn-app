import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import toast from 'react-hot-toast';
import {
  Building2, Globe, Users, MapPin, Phone, Mail,
  FileText, Save, Briefcase,
} from 'lucide-react';

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
function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className={`label ${required ? 'label-required' : ''}`}>{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

// ── 2-col grid ────────────────────────────────────────────────
function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

// ── Save row ──────────────────────────────────────────────────
function SaveRow({ isPending, onClick }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="btn-primary btn-sm flex items-center gap-1.5"
      >
        <Save className="h-3.5 w-3.5" />
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

export default function EmployerProfilePage() {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employer', 'me'],
    queryFn: employerService.getMe,
  });

  // ── Local section state ───────────────────────────────────
  const p = profile ?? {};
  const [company,  setCompany]  = useState(null);
  const [desc,     setDesc]     = useState(null);
  const [location, setLocation] = useState(null);
  const [hrContact, setHrContact] = useState(null);

  const getCompany  = () => company  ?? { companyName: p.companyName  || '', industry: p.industry   || '', companySize: p.companySize || '', website: p.website || '' };
  const getDesc     = () => desc     ?? p.description ?? '';
  const getLocation = () => location ?? p.location    ?? {};
  const getHrContact= () => hrContact ?? p.hrContact  ?? {};

  // ── Save mutation ─────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (body) => employerService.updateMe(body),
    onSuccess: () => {
      toast.success('Profile saved!');
      qc.invalidateQueries({ queryKey: ['employer', 'me'] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.error?.message || err.message || 'Save failed'),
  });

  const handleSave = useCallback((patch) => saveMutation.mutate(patch), [saveMutation]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 skeleton-title w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 space-y-4">
            <div className="h-6 skeleton w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 skeleton" />
              <div className="h-10 skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const co = getCompany();
  const lo = getLocation();
  const hr = getHrContact();

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Keep your company details up-to-date to attract the right candidates
        </p>
      </div>

      {/* ── Company header card ─────────────────────────── */}
      <div className="card p-5 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-brand-50 ring-2 ring-brand-100 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-7 w-7 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-lg">
            {p.companyName || 'Your Company'}
          </p>
          <p className="text-sm text-slate-500">
            {[p.industry, p.companySize && `${p.companySize} employees`]
              .filter(Boolean).join(' · ') || 'Complete your profile below'}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {p.industry   && <span className="badge-brand">{p.industry}</span>}
            {p.verified   && <span className="badge-green">Verified</span>}
            {p.companySize && <span className="badge-default">{p.companySize}</span>}
          </div>
        </div>
      </div>

      {/* ── Company Info ────────────────────────────────── */}
      <Section icon={Briefcase} title="Company Information">
        <Grid2>
          <Field label="Company Name">
            <input
              className="input"
              defaultValue={co.companyName}
              onChange={(e) => setCompany({ ...getCompany(), companyName: e.target.value })}
              placeholder="Acme Inc."
            />
          </Field>
          <Field label="Industry">
            <input
              className="input"
              defaultValue={co.industry}
              onChange={(e) => setCompany({ ...getCompany(), industry: e.target.value })}
              placeholder="Technology"
            />
          </Field>
          <Field label="Company Size" hint="e.g. 10–50, 50–200, 500+">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="input pl-9"
                defaultValue={co.companySize}
                onChange={(e) => setCompany({ ...getCompany(), companySize: e.target.value })}
                placeholder="50–200"
              />
            </div>
          </Field>
          <Field label="Website">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="input pl-9"
                defaultValue={co.website}
                onChange={(e) => setCompany({ ...getCompany(), website: e.target.value })}
                placeholder="https://acme.com"
              />
            </div>
          </Field>
        </Grid2>
        <SaveRow
          isPending={saveMutation.isPending}
          onClick={() => handleSave({
            companyName: co.companyName,
            industry:    co.industry,
            companySize: co.companySize,
            website:     co.website,
          })}
        />
      </Section>

      {/* ── Description ─────────────────────────────────── */}
      <Section icon={FileText} title="About the Company">
        <Field label="Company Description" hint="Tell candidates about your culture, mission, and what makes you unique">
          <textarea
            className="textarea"
            rows={5}
            defaultValue={getDesc()}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="We are a team of passionate engineers building the future of..."
          />
        </Field>
        <SaveRow
          isPending={saveMutation.isPending}
          onClick={() => handleSave({ description: getDesc() })}
        />
      </Section>

      {/* ── Location ────────────────────────────────────── */}
      <Section icon={MapPin} title="Location">
        <Grid2>
          <Field label="City">
            <input
              className="input"
              defaultValue={lo.city}
              onChange={(e) => setLocation({ ...getLocation(), city: e.target.value })}
              placeholder="Bangalore"
            />
          </Field>
          <Field label="State">
            <input
              className="input"
              defaultValue={lo.state}
              onChange={(e) => setLocation({ ...getLocation(), state: e.target.value })}
              placeholder="Karnataka"
            />
          </Field>
          <Field label="Country">
            <input
              className="input"
              defaultValue={lo.country}
              onChange={(e) => setLocation({ ...getLocation(), country: e.target.value })}
              placeholder="India"
            />
          </Field>
        </Grid2>
        <SaveRow
          isPending={saveMutation.isPending}
          onClick={() => handleSave({ location: getLocation() })}
        />
      </Section>

      {/* ── HR Contact ──────────────────────────────────── */}
      <Section icon={Phone} title="HR Contact">
        <p className="text-xs text-slate-400 -mt-2">
          Visible to shortlisted candidates only
        </p>
        <Grid2>
          <Field label="Contact Name">
            <input
              className="input"
              defaultValue={hr.name}
              onChange={(e) => setHrContact({ ...getHrContact(), name: e.target.value })}
              placeholder="Priya Sharma"
            />
          </Field>
          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                className="input pl-9"
                defaultValue={hr.email}
                onChange={(e) => setHrContact({ ...getHrContact(), email: e.target.value })}
                placeholder="hr@acme.com"
              />
            </div>
          </Field>
          <Field label="Phone">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="tel"
                className="input pl-9"
                defaultValue={hr.phone}
                onChange={(e) => setHrContact({ ...getHrContact(), phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </Field>
        </Grid2>
        <SaveRow
          isPending={saveMutation.isPending}
          onClick={() => handleSave({ hrContact: getHrContact() })}
        />
      </Section>
    </div>
  );
}