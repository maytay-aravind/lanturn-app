import { useQuery } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { jobService } from '../../services/job.service.js';
import { Link } from 'react-router-dom';

export default function EmployerDashboard() {
  const { data: profile } = useQuery({
    queryKey: ['employer', 'me'],
    queryFn: employerService.getMe,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'mine'],
    queryFn: () => jobService.listMine({ limit: 5 }),
  });

  const jobs = jobsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.companyName || 'Employer'}
        </h1>
        <p className="text-gray-500">{profile?.industry} · {profile?.companySize} employees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Active Jobs</p>
          <p className="text-2xl font-bold text-indigo-600">
            {jobs.filter((j) => j.status === 'active').length}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{jobsData?.meta?.totalItems ?? jobs.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Industry</p>
          <p className="text-2xl font-bold text-gray-900">{profile?.industry || 'N/A'}</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Job Postings</h2>
          <Link to="/employer/jobs" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm">No jobs posted yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <div key={job.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.location} · {job.type}</p>
                </div>
                <span className={`badge ${
                  job.status === 'active' ? 'bg-green-100 text-green-700' :
                  job.status === 'closed' ? 'bg-gray-100 text-gray-500' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}