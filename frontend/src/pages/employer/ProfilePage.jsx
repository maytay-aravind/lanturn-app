import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import toast from 'react-hot-toast';

export default function EmployerProfilePage() {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employer', 'me'],
    queryFn: employerService.getMe,
  });

  const [form, setForm] = useState({});
  const updateMutation = useMutation({
    mutationFn: (body) => employerService.updateMe(body),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['employer', 'me'] });
    },
    onError: (err) => toast.error(err.message || 'Update failed'),
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-500">Update your employer profile</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          {[
            { name: 'companyName', label: 'Company Name' },
            { name: 'industry', label: 'Industry' },
            { name: 'website', label: 'Website' },
            { name: 'companySize', label: 'Company Size' },
            { name: 'designation', label: 'Your Designation' },
            { name: 'description', label: 'Company Description', tag: 'textarea' },
          ].map((f) => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              {f.tag === 'textarea' ? (
                <textarea name={f.name} rows={3} defaultValue={profile?.[f.name] || ''} onChange={handleChange} className="input" />
              ) : (
                <input name={f.name} type="text" defaultValue={profile?.[f.name] || ''} onChange={handleChange} className="input" />
              )}
            </div>
          ))}
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}