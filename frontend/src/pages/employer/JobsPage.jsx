import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/job.service.js';
import toast from 'react-hot-toast';
import { formatSalary, timeAgo } from '../../lib/utils.js';

export default function EmployerJobsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['jobs', 'mine'],
    queryFn: () => jobService.listMine({ limit: 20 }),
  });

  const jobs = data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: jobService.create,
    onSuccess: () => {
      toast.success('Job posted!');
      setShowForm(false);
      setForm({});
      qc.invalidateQueries({ queryKey: ['jobs', 'mine'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to post job'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => jobService.update(id, body),
    onSuccess: () => {
      toast.success('Job updated!');
      setEditingId(null);
      setForm({});
      qc.invalidateQueries({ queryKey: ['jobs', 'mine'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update job'),
  });

  const deleteMutation = useMutation({
    mutationFn: jobService.remove,
    onSuccess: () => {
      toast.success('Job deleted');
      qc.invalidateQueries({ queryKey: ['jobs', 'mine'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to delete job'),
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, body: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      experienceLevel: job.experienceLevel,
    });
    setShowForm(true);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500">Manage your job postings</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({}); }} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Post New Job'}
        </button>
      </div>

      {/* Job Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Job' : 'Post New Job'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {[
              { name: 'title', label: 'Job Title' },
              { name: 'location', label: 'Location' },
            ].map((f) => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input name={f.name} value={form[f.name] || ''} onChange={handleChange} className="input" required />
              </div>
            ))}
            <div>
              <label className="label">Description</label>
              <textarea name="description" rows={4} value={form.description || ''} onChange={handleChange} className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Type</label>
                <select name="type" value={form.type || ''} onChange={handleChange} className="input" required>
                  <option value="">Select...</option>
                  {['full-time', 'part-time', 'internship', 'contract'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Experience Level</label>
                <select name="experienceLevel" value={form.experienceLevel || ''} onChange={handleChange} className="input">
                  <option value="">Any</option>
                  {['entry', 'mid', 'senior'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Min Salary (LPA)</label>
                <input name="salaryMin" type="number" value={form.salaryMin || ''} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Max Salary (LPA)</label>
                <input name="salaryMax" type="number" value={form.salaryMax || ''} onChange={handleChange} className="input" />
              </div>
            </div>
            <button type="submit" disabled={isMutating} className="btn-primary">
              {isMutating ? 'Saving...' : editingId ? 'Update Job' : 'Post Job'}
            </button>
          </form>
        </div>
      )}

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No jobs posted yet</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={`badge ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' :
                      job.status === 'closed' ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{job.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
                  {job.salaryMin && (
                    <p className="text-sm text-gray-400 mt-1">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Posted {timeAgo(job.postedAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(job)} className="btn-secondary text-sm">Edit</button>
                  <button onClick={() => { if (confirm('Delete this job?')) deleteMutation.mutate(job.id); }} className="btn-danger text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}