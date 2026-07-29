import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authService } from '../services/auth.service.js';
import toast from 'react-hot-toast';

const STUDENT_FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
  { name: 'collegeName', label: 'College Name', type: 'text', placeholder: 'MIT' },
  { name: 'degree', label: 'Degree', type: 'text', placeholder: 'B.Tech Computer Science' },
  { name: 'graduationYear', label: 'Graduation Year', type: 'number', placeholder: '2026' },
  { name: 'skills', label: 'Skills (comma-separated)', type: 'text', placeholder: 'React, Node.js, Python' },
];

const EMPLOYER_FIELDS = [
  { name: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Acme Inc.' },
  { name: 'industry', label: 'Industry', type: 'text', placeholder: 'Technology' },
  { name: 'website', label: 'Website', type: 'text', placeholder: 'https://acme.com' },
  { name: 'companySize', label: 'Company Size', type: 'text', placeholder: '50-200' },
  { name: 'designation', label: 'Your Designation', type: 'text', placeholder: 'HR Manager' },
];

export default function OnboardingPage() {
  const { firebaseUser, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    setSubmitting(true);
    try {
      const profileData = { ...form };
      if (role === 'student' && form.skills) {
        profileData.skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      const payload = { role, profile: profileData };
      await authService.onboard(payload);
      await refreshSession();
      toast.success('Profile created!');
      navigate(role === 'student' ? '/dashboard' : '/employer/dashboard');
    } catch (err) {
      toast.error(err.message || 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!firebaseUser) return null;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="card p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Profile</h1>
        <p className="text-gray-500 mb-6">Tell us about yourself to get started</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="label">I am a</label>
            <div className="flex gap-3 mt-1">
              {['student', 'employer'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium capitalize transition ${
                    role === r
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          {role === 'student' && STUDENT_FIELDS.map((f) => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name] || ''}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          ))}

          {role === 'employer' && EMPLOYER_FIELDS.map((f) => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name] || ''}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          ))}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}